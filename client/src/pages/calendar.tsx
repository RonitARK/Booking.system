import { useState } from "react";
import { useCalendar } from "@/context/calendar-context";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import CalendarToolbar from "@/components/calendar/calendar-toolbar";
import DayView from "@/components/calendar/day-view";
import WeekView from "@/components/calendar/week-view";
import MonthView from "@/components/calendar/month-view";
import AppointmentForm from "@/components/calendar/appointment-form";
import AIAssistantPanel from "@/components/ai/ai-assistant-panel";
import { LightbulbIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Calendar() {
  const { view } = useCalendar();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointmentFormOpen, setAppointmentFormOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [initialAppointmentDate, setInitialAppointmentDate] = useState<Date | undefined>(undefined);
  
  const handleNewAppointment = () => {
    setInitialAppointmentDate(new Date());
    setAppointmentFormOpen(true);
  };
  
  const handleScheduleWithTime = (time?: Date) => {
    setInitialAppointmentDate(time || new Date());
    setAppointmentFormOpen(true);
  };
  
  const renderCalendarView = () => {
    switch (view) {
      case "day":
        return <DayView />;
      case "week":
        return <WeekView />;
      case "month":
        return <MonthView />;
      default:
        return <DayView />;
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto bg-white dark:bg-gray-800">
          <CalendarToolbar onNewAppointment={handleNewAppointment} />
          {renderCalendarView()}
          
          {/* AI Assistant Button */}
          <div className="fixed bottom-4 right-4 z-20">
            <Button
              className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
              onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
            >
              <LightbulbIcon className="w-6 h-6" />
            </Button>
          </div>
          
          {/* AI Assistant Panel */}
          <AIAssistantPanel 
            isOpen={aiAssistantOpen} 
            onClose={() => setAiAssistantOpen(false)}
            onScheduleAppointment={handleScheduleWithTime}
          />
          
          {/* Appointment Form Modal */}
          <AppointmentForm
            isOpen={appointmentFormOpen}
            onClose={() => setAppointmentFormOpen(false)}
            initialDate={initialAppointmentDate}
          />
        </main>
      </div>
    </div>
  );
}
