import { useState } from "react";
import { format, addDays, subDays, addMonths, subMonths, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/context/calendar-context";

interface CalendarToolbarProps {
  onNewAppointment: () => void;
}

export default function CalendarToolbar({ onNewAppointment }: CalendarToolbarProps) {
  const { currentDate, setCurrentDate, view, setView } = useCalendar();
  
  const navigatePrevious = () => {
    switch(view) {
      case "day":
        setCurrentDate(subDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };
  
  const navigateNext = () => {
    switch(view) {
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };
  
  const formatDateDisplay = () => {
    switch(view) {
      case "day":
        return format(currentDate, "MMMM d, yyyy");
      case "week":
        const startOfWeek = currentDate;
        const endOfWeek = addDays(startOfWeek, 6);
        return `${format(startOfWeek, "MMM d")} - ${format(endOfWeek, "MMM d, yyyy")}`;
      case "month":
        return format(currentDate, "MMMM yyyy");
      default:
        return format(currentDate, "MMMM d, yyyy");
    }
  };
  
  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between">
      <div className="flex items-center space-x-3 mb-4 sm:mb-0">
        <h2 className="text-xl font-semibold">Calendar</h2>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <Button 
            variant={view === "day" ? "default" : "ghost"} 
            size="sm" 
            className={`px-3 py-1 text-sm rounded-md ${view === "day" ? "bg-white dark:bg-gray-600 shadow text-primary-600 dark:text-primary-400" : "text-gray-600 dark:text-gray-300"}`}
            onClick={() => setView("day")}
          >
            Day
          </Button>
          <Button 
            variant={view === "week" ? "default" : "ghost"} 
            size="sm" 
            className={`px-3 py-1 text-sm rounded-md ${view === "week" ? "bg-white dark:bg-gray-600 shadow text-primary-600 dark:text-primary-400" : "text-gray-600 dark:text-gray-300"}`}
            onClick={() => setView("week")}
          >
            Week
          </Button>
          <Button 
            variant={view === "month" ? "default" : "ghost"} 
            size="sm" 
            className={`px-3 py-1 text-sm rounded-md ${view === "month" ? "bg-white dark:bg-gray-600 shadow text-primary-600 dark:text-primary-400" : "text-gray-600 dark:text-gray-300"}`}
            onClick={() => setView("month")}
          >
            Month
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={navigatePrevious}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-lg font-medium">{formatDateDisplay()}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={navigateNext}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        <Button 
          className="ml-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center space-x-2"
          onClick={onNewAppointment}
        >
          <Plus className="w-5 h-5" />
          <span>New Appointment</span>
        </Button>
      </div>
    </div>
  );
}
