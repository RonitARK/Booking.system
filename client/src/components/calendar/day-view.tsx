import { useRef, useState, useEffect } from "react";
import { useAppointments } from "@/hooks/use-appointments";
import { formatTime, getAppointmentPosition } from "@/lib/utils";
import { useCalendar } from "@/context/calendar-context";
import AppointmentItem from "./appointment-item";
import { format, startOfDay, addHours, addMinutes } from "date-fns";

// Generate business hours (8 AM to 6 PM)
const BUSINESS_HOURS = Array.from({ length: 11 }, (_, i) => {
  const hour = i + 8; // Start from 8 AM
  return hour;
});

export default function DayView() {
  const { currentDate } = useCalendar();
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: appointments, isLoading } = useAppointments({
    startDate: startOfDay(currentDate),
    endDate: addHours(startOfDay(currentDate), 24)
  });
  
  // Current time indicator
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  
  useEffect(() => {
    // Calculate initial position for the current time indicator
    updateTimeIndicator();
    
    // Update the indicator every minute
    const interval = setInterval(updateTimeIndicator, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const updateTimeIndicator = () => {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(8, 0, 0, 0); // 8 AM
    
    const minutesSinceDayStart = 
      (now.getHours() - dayStart.getHours()) * 60 + now.getMinutes();
    
    // Convert to pixels (80px per hour)
    const position = (minutesSinceDayStart / 60) * 80;
    setCurrentTimePosition(position);
  };
  
  const isToday = () => {
    const today = new Date();
    return (
      today.getDate() === currentDate.getDate() &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };
  
  // Get AI recommendation position
  const getRecommendationPosition = () => {
    // For demo, suggest 2:30 PM slot
    const recommendedTime = new Date(currentDate);
    recommendedTime.setHours(14, 30, 0, 0);
    
    return getAppointmentPosition(
      recommendedTime, 
      addMinutes(recommendedTime, 30),
      8, // Day starts at 8 AM
      80  // Each hour is 80px tall
    );
  };
  
  const recommendationPos = getRecommendationPosition();
  
  return (
    <div className="flex h-[calc(100%-4rem)]">
      {/* Time indicators */}
      <div className="w-20 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
        {BUSINESS_HOURS.map(hour => {
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hourDisplay = hour > 12 ? hour - 12 : hour;
          return (
            <div key={hour} className="relative h-20">
              <span className="absolute -top-2.5 left-4 text-xs text-gray-500 dark:text-gray-400">
                {`${hourDisplay}:00 ${ampm}`}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Day grid */}
      <div className="flex-1 overflow-y-auto relative" ref={containerRef}>
        {/* Current time indicator */}
        {isToday() && (
          <div 
            className="absolute w-full border-t-2 border-orange-500 z-10" 
            style={{ 
              top: `${currentTimePosition}px`, 
              left: '0px', 
              right: '0px' 
            }}
          >
            <div className="w-3 h-3 rounded-full bg-orange-500 -mt-1.5 -ml-1.5"></div>
          </div>
        )}
        
        {/* Hour grid lines */}
        {BUSINESS_HOURS.map(hour => (
          <div key={hour} className="h-20 border-b border-gray-200 dark:border-gray-700"></div>
        ))}
        
        {/* Appointment items */}
        {isLoading ? (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400">Loading appointments...</div>
          </div>
        ) : appointments?.length === 0 ? (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400">No appointments scheduled</div>
          </div>
        ) : (
          appointments?.map(appointment => {
            const { top, height } = getAppointmentPosition(
              new Date(appointment.startTime),
              new Date(appointment.endTime),
              8, // Day starts at 8 AM
              80  // Each hour is 80px tall
            );
            
            return (
              <AppointmentItem
                key={appointment.id}
                appointment={appointment}
                style={{ 
                  top: `${top}px`, 
                  height: `${height}px`,
                  left: '6px',
                  right: '6px'
                }}
              />
            );
          })
        )}
        
        {/* AI-suggested slot */}
        <div 
          className="absolute z-10 left-6 right-6 rounded-lg border border-dashed border-orange-500 bg-orange-50 dark:bg-orange-900/20 p-3 cursor-pointer" 
          style={{ 
            top: `${recommendationPos.top}px`, 
            height: `${recommendationPos.height}px` 
          }}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            <span className="font-medium text-orange-700 dark:text-orange-300">AI-Recommended Slot</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 ml-7">Optimal time based on your schedule patterns</p>
        </div>
      </div>
    </div>
  );
}
