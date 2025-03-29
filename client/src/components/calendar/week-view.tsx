import { useRef, useState, useEffect } from "react";
import { useAppointments } from "@/hooks/use-appointments";
import { formatTime, getAppointmentPosition } from "@/lib/utils";
import { useCalendar } from "@/context/calendar-context";
import AppointmentItem from "./appointment-item";
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  isToday, 
  isSameDay 
} from "date-fns";

// Generate business hours (8 AM to 6 PM)
const BUSINESS_HOURS = Array.from({ length: 11 }, (_, i) => {
  const hour = i + 8; // Start from 8 AM
  return hour;
});

export default function WeekView() {
  const { currentDate } = useCalendar();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get the start and end of the week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // 0 = Sunday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  
  // Generate days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const { data: appointments, isLoading } = useAppointments({
    startDate: weekStart,
    endDate: weekEnd
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
  
  // Group appointments by day
  const getAppointmentsForDay = (day: Date) => {
    if (!appointments) return [];
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime);
      return isSameDay(appointmentDate, day);
    });
  };
  
  return (
    <div className="flex h-[calc(100%-4rem)]">
      {/* Time indicators */}
      <div className="w-20 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
        <div className="h-14 border-b border-gray-200 dark:border-gray-700"></div>
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
      
      {/* Week grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className="flex-1 min-w-[120px] border-r border-gray-200 dark:border-gray-700 last:border-r-0"
            >
              <div className={`h-14 flex flex-col items-center justify-center border-b border-gray-200 dark:border-gray-700 ${
                isToday(day) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
              }`}>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-xl font-semibold ${
                  isToday(day) ? 'text-primary-600 dark:text-primary-400' : ''
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
              
              <div className="relative">
                {/* Hour grid lines */}
                {BUSINESS_HOURS.map(hour => (
                  <div key={hour} className="h-20 border-b border-gray-200 dark:border-gray-700"></div>
                ))}
                
                {/* Current time indicator */}
                {isToday(day) && (
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
                
                {/* Appointment items */}
                {getAppointmentsForDay(day).map(appointment => {
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
                        left: '2px',
                        right: '2px'
                      }}
                      compact={true}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
