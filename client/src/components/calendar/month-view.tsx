import { useState } from "react";
import { useAppointments } from "@/hooks/use-appointments";
import { useCalendar } from "@/context/calendar-context";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  startOfWeek,
  endOfWeek,
  isSameDay
} from "date-fns";
import { cn, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function MonthView() {
  const { currentDate, setCurrentDate, setView } = useCalendar();
  
  // Get the first and last day of the month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get all days from the start of the week of the first day to the end of the week of the last day
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  // Generate all days for the calendar view
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Split days into weeks
  const calendarWeeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    calendarWeeks.push(calendarDays.slice(i, i + 7));
  }
  
  const { data: appointments, isLoading } = useAppointments({
    startDate: calendarStart,
    endDate: calendarEnd
  });
  
  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    if (!appointments) return [];
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime);
      return isSameDay(appointmentDate, day);
    });
  };
  
  // Handle day click
  const handleDayClick = (day: Date) => {
    setCurrentDate(day);
    setView("day");
  };
  
  return (
    <div className="h-[calc(100%-4rem)] overflow-auto">
      <div className="grid grid-cols-7 text-xs leading-6 text-center text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
        <div className="py-2">Sun</div>
        <div className="py-2">Mon</div>
        <div className="py-2">Tue</div>
        <div className="py-2">Wed</div>
        <div className="py-2">Thu</div>
        <div className="py-2">Fri</div>
        <div className="py-2">Sat</div>
      </div>
      
      <div className="flex-1">
        {calendarWeeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 text-sm">
            {week.map((day, dayIndex) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              
              return (
                <div 
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    "min-h-[100px] p-2 border-b border-r border-gray-200 dark:border-gray-700",
                    !isCurrentMonth && "bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600"
                  )}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="flex justify-between">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm",
                        isCurrentDay && "bg-primary-600 text-white font-semibold"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {dayAppointments.length > 0 && !isCurrentMonth && (
                      <Badge variant="outline" className="text-xs">
                        {dayAppointments.length}
                      </Badge>
                    )}
                  </div>
                  
                  {isCurrentMonth && (
                    <div className="mt-2 space-y-1 max-h-[80px] overflow-hidden">
                      {isLoading ? (
                        <div className="text-xs text-gray-400">Loading...</div>
                      ) : dayAppointments.length > 0 ? (
                        <>
                          {dayAppointments.slice(0, 2).map(appointment => (
                            <div 
                              key={appointment.id} 
                              className="text-xs p-1 rounded truncate"
                              style={{ backgroundColor: `${appointment.color}20`, color: appointment.color }}
                            >
                              {formatTime(new Date(appointment.startTime))} {appointment.title}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{dayAppointments.length - 2} more
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
