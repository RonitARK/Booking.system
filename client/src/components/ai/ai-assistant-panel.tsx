import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useAppointments } from "@/hooks/use-appointments";
import { useAiSuggestions } from "@/hooks/use-ai-suggestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, LightbulbIcon, X, SendIcon } from "lucide-react";
import { useCalendar } from "@/context/calendar-context";
import { formatTime } from "@/lib/utils";

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleAppointment: (time?: Date) => void;
}

export default function AIAssistantPanel({ 
  isOpen, 
  onClose,
  onScheduleAppointment
}: AIAssistantPanelProps) {
  const { user } = useAuth();
  const { currentDate } = useCalendar();
  const { generateSuggestion, aiSuggestion, isLoading } = useAiSuggestions();
  const [query, setQuery] = useState("");
  
  // Generate suggestions when the panel is opened
  useEffect(() => {
    if (isOpen && !aiSuggestion) {
      generateSuggestion(currentDate);
    }
  }, [isOpen, currentDate]);
  
  const handleSendQuery = () => {
    if (!query.trim()) return;
    
    // In a real implementation, this would send the query to the AI
    console.log("User query:", query);
    setQuery("");
  };
  
  const handleScheduleNow = (startTime: string) => {
    const scheduledTime = new Date(startTime);
    onScheduleAppointment(scheduledTime);
    onClose();
  };
  
  const handleSendReminder = () => {
    // In a real implementation, this would trigger a notification
    console.log("Sending reminder");
  };
  
  return (
    <div className={`fixed bottom-4 right-4 z-20 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80 absolute bottom-16 right-0 overflow-hidden">
        <div className="p-4 bg-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LightbulbIcon className="w-6 h-6" />
              <h4 className="font-medium">SmartBook AI Assistant</h4>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose} 
              className="text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Based on your schedule and preferences, I suggest:
              </p>
              
              <div className="space-y-3">
                {aiSuggestion && aiSuggestion.recommended_slots && aiSuggestion.recommended_slots.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h5 className="font-medium text-sm">Optimize Today's Schedule</h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400 my-1">
                      {formatTime(new Date(aiSuggestion.recommended_slots[0].startTime))} looks like a good slot for your next client meeting.
                    </p>
                    <Button 
                      variant="link" 
                      className="text-xs text-primary-600 dark:text-primary-400 p-0 h-auto mt-1"
                      onClick={() => handleScheduleNow(aiSuggestion.recommended_slots[0].startTime)}
                    >
                      Schedule Now
                    </Button>
                  </div>
                )}
                
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <h5 className="font-medium text-sm">Potential No-Show Alert</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 my-1">
                    Client Michael Thompson has missed 2 previous appointments.
                  </p>
                  <Button 
                    variant="link" 
                    className="text-xs text-primary-600 dark:text-primary-400 p-0 h-auto mt-1"
                    onClick={handleSendReminder}
                  >
                    Send Reminder
                  </Button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <h5 className="font-medium text-sm">Staff Availability</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 my-1">
                    3 team members are available for the 4 PM meeting.
                  </p>
                  <Button 
                    variant="link" 
                    className="text-xs text-primary-600 dark:text-primary-400 p-0 h-auto mt-1"
                    onClick={() => window.location.href = '/staff'}
                  >
                    View Staff
                  </Button>
                </div>
                
                {aiSuggestion && aiSuggestion.insights && aiSuggestion.insights.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h5 className="font-medium text-sm">Schedule Insights</h5>
                    <ul className="text-xs text-gray-500 dark:text-gray-400 my-1 space-y-1">
                      {aiSuggestion.insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex">
          <Input
            type="text"
            placeholder="Ask anything..."
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
          />
          <Button 
            className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-r-lg"
            onClick={handleSendQuery}
          >
            <SendIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
