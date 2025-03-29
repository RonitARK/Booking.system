import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { useAppointments } from "@/hooks/use-appointments";
import { useAiSuggestions } from "@/hooks/use-ai-suggestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  LightbulbIcon, 
  X, 
  SendIcon,
  Calendar,
  Clock,
  AlertTriangle,
  LineChart,
  UserCheck 
} from "lucide-react";
import { useCalendar } from "@/context/calendar-context";
import { formatTime, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleAppointment: (time?: Date) => void;
}

type MessageType = 'user' | 'assistant';

interface ChatMessage {
  type: MessageType;
  text: string;
  timestamp: Date;
}

export default function AIAssistantPanel({ 
  isOpen, 
  onClose,
  onScheduleAppointment
}: AIAssistantPanelProps) {
  const { user } = useAuth();
  const { currentDate } = useCalendar();
  const { generateSuggestion, aiSuggestion, isLoading } = useAiSuggestions();
  const { toast } = useToast();
  
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: appointments } = useAppointments({ 
    startDate: new Date(currentDate.setHours(0, 0, 0, 0)),
    endDate: new Date(currentDate.setHours(23, 59, 59, 999))
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Generate suggestions when the panel is opened
  useEffect(() => {
    if (isOpen && !aiSuggestion) {
      generateSuggestion(currentDate);
      
      // Add welcome message if no messages
      if (messages.length === 0) {
        setMessages([{
          type: 'assistant',
          text: `Hello ${user?.name || 'there'}! I'm your SmartBook AI assistant. I can help you manage your schedule, find optimal meeting times, and provide insights on your appointments. What can I help you with today?`,
          timestamp: new Date()
        }]);
      }
    }
  }, [isOpen, currentDate, user]);
  
  const handleSendQuery = async () => {
    if (!query.trim() || isProcessing) return;
    
    const userMessage = {
      type: 'user' as MessageType,
      text: query,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsProcessing(true);
    
    try {
      // In a real implementation with a complete backend, we would send the query to the API
      // For now, we'll simulate a response based on the query
      let response = "";
      
      // Simple keyword matching for demo purposes
      const lowercaseQuery = query.toLowerCase();
      
      if (lowercaseQuery.includes('schedule') || lowercaseQuery.includes('book') || lowercaseQuery.includes('appointment')) {
        if (aiSuggestion?.recommended_slots && aiSuggestion.recommended_slots.length > 0) {
          const slot = aiSuggestion.recommended_slots[0];
          response = `Based on your schedule, I recommend booking at ${formatTime(new Date(slot.startTime))}. ${slot.reason} Would you like me to schedule an appointment at this time?`;
        } else {
          response = "I can help you schedule an appointment. What time works best for you?";
        }
      } else if (lowercaseQuery.includes('insight') || lowercaseQuery.includes('analyze') || lowercaseQuery.includes('suggestion')) {
        if (aiSuggestion?.insights && aiSuggestion.insights.length > 0) {
          response = "Here are some insights about your schedule:\n\n" + 
            aiSuggestion.insights.map((insight: string) => `• ${insight}`).join('\n');
        } else {
          response = "I'm analyzing your schedule patterns to provide personalized insights. Check back soon!";
        }
      } else if (lowercaseQuery.includes('no-show') || lowercaseQuery.includes('risk') || lowercaseQuery.includes('cancel')) {
        if (aiSuggestion?.no_show_risks && aiSuggestion.no_show_risks.length > 0) {
          const risk = aiSuggestion.no_show_risks[0];
          const appointment = appointments?.find(a => a.id === risk.appointmentId);
          
          if (appointment) {
            // Get client name from clientId reference
            const clientName = appointment.clientId ? `Client #${appointment.clientId}` : "Unknown client";
            response = `There's a ${Math.round(risk.risk * 100)}% risk that the appointment with ${clientName} at ${formatTime(new Date(appointment.startTime))} might be a no-show. Reason: ${risk.reason}. Would you like to send them a reminder?`;
          } else {
            response = "I've identified some appointments with no-show risks. Would you like to see them?";
          }
        } else {
          response = "Currently, there are no high-risk appointments for no-shows in your schedule.";
        }
      } else if (lowercaseQuery.includes('today') || lowercaseQuery.includes('schedule today')) {
        if (appointments && appointments.length > 0) {
          response = `Here's your schedule for today (${formatDate(currentDate)}):\n\n` + 
            appointments.map(apt => {
              // Get client name from clientId reference
              const clientName = apt.clientId ? `Client #${apt.clientId}` : "No client";
              return `• ${formatTime(new Date(apt.startTime))} - ${formatTime(new Date(apt.endTime))}: ${apt.title} with ${clientName}`;
            }).join('\n');
        } else {
          response = `You don't have any appointments scheduled for today (${formatDate(currentDate)}).`;
        }
      } else if (lowercaseQuery.includes('hello') || lowercaseQuery.includes('hi') || lowercaseQuery.includes('hey')) {
        response = `Hello ${user?.name || 'there'}! How can I assist you with your scheduling today?`;
      } else if (lowercaseQuery.includes('thank')) {
        response = "You're welcome! Is there anything else I can help you with?";
      } else {
        // Default response
        response = "I understand you're asking about " + query.split(' ').slice(0, 3).join(' ') + "... To help you better, could you ask about scheduling, insights, or potential no-shows?";
      }
      
      // Add a slight delay to simulate processing
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'assistant',
          text: response,
          timestamp: new Date()
        }]);
        setIsProcessing(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error processing query:", error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      }]);
      setIsProcessing(false);
    }
  };
  
  const handleScheduleNow = (startTime: string) => {
    const scheduledTime = new Date(startTime);
    
    // Add a message to confirm
    setMessages(prev => [...prev, {
      type: 'assistant',
      text: `Great! I'm opening the appointment form for ${formatTime(scheduledTime)}`,
      timestamp: new Date()
    }]);
    
    // Wait a moment before closing and scheduling
    setTimeout(() => {
      onScheduleAppointment(scheduledTime);
      onClose();
    }, 1500);
  };
  
  const handleSendReminder = () => {
    // Simulate sending a reminder
    setIsProcessing(true);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'assistant',
        text: "Reminder sent! The client has been notified about their upcoming appointment.",
        timestamp: new Date()
      }]);
      setIsProcessing(false);
      
      toast({
        title: "Reminder Sent",
        description: "The client has been notified about their upcoming appointment",
      });
    }, 1000);
  };
  
  // Render chat message with proper formatting
  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.type === 'user';
    
    return (
      <div 
        key={index} 
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}
      >
        <div 
          className={`max-w-[80%] p-3 rounded-lg ${
            isUser 
              ? 'bg-primary text-white rounded-br-none' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
          }`}
        >
          <p className="text-sm whitespace-pre-line">{message.text}</p>
          <span className="text-xs mt-1 opacity-70 block text-right">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`fixed bottom-4 right-4 z-20 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-96 absolute bottom-16 right-0 overflow-hidden flex flex-col" style={{ height: '500px' }}>
        <div className="p-4 bg-primary text-white">
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
        
        <div className="flex flex-1 overflow-hidden">
          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length > 0 ? (
              <div className="space-y-2">
                {messages.map(renderMessage)}
                {isProcessing && (
                  <div className="flex justify-start mb-2">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading your AI assistant...</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <LightbulbIcon className="h-12 w-12 text-primary mx-auto" />
                  <p className="text-lg font-medium">How can I help you today?</p>
                  <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={() => setQuery("Help me schedule an appointment")}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Schedule</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={() => setQuery("Show me today's schedule")}
                    >
                      <Clock className="h-4 w-4" />
                      <span>Today</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={() => setQuery("Any no-show risks today?")}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span>No-shows</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={() => setQuery("Give me schedule insights")}
                    >
                      <LineChart className="h-4 w-4" />
                      <span>Insights</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* AI suggestions sidebar */}
          {aiSuggestion && !isLoading && (
            <div className="w-1/3 border-l border-gray-200 dark:border-gray-700 p-3 overflow-y-auto hidden md:block">
              <h5 className="font-medium text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">AI Recommendations</h5>
              
              <div className="space-y-3">
                {aiSuggestion.recommended_slots && aiSuggestion.recommended_slots.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    <div className="flex items-center text-primary mb-1">
                      <Clock className="w-3 h-3 mr-1" />
                      <h6 className="text-xs font-medium">Best Slots</h6>
                    </div>
                    <div className="space-y-1">
                      {aiSuggestion.recommended_slots.slice(0, 2).map((slot: any, idx: number) => (
                        <div key={idx} className="text-xs">
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-xs"
                            onClick={() => handleScheduleNow(slot.startTime)}
                          >
                            {formatTime(new Date(slot.startTime))}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {aiSuggestion.no_show_risks && aiSuggestion.no_show_risks.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    <div className="flex items-center text-primary mb-1">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      <h6 className="text-xs font-medium">No-Show Risks</h6>
                    </div>
                    <div className="space-y-1">
                      {aiSuggestion.no_show_risks.slice(0, 2).map((risk: any, idx: number) => {
                        const apt = appointments?.find(a => a.id === risk.appointmentId);
                        const clientName = apt?.clientId ? `Client #${apt.clientId}` : "Unknown client";
                        return apt ? (
                          <div key={idx} className="text-xs text-gray-600 dark:text-gray-300">
                            {clientName}: {Math.round(risk.risk * 100)}% risk
                          </div>
                        ) : null;
                      })}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-xs"
                        onClick={handleSendReminder}
                      >
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                )}
                
                {aiSuggestion.insights && aiSuggestion.insights.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    <div className="flex items-center text-primary mb-1">
                      <LineChart className="w-3 h-3 mr-1" />
                      <h6 className="text-xs font-medium">Insights</h6>
                    </div>
                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 pl-4 list-disc">
                      {aiSuggestion.insights.slice(0, 2).map((insight: string, idx: number) => (
                        <li key={idx}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex">
          <Input
            type="text"
            placeholder="Ask anything..."
            className="flex-1 border-gray-300 dark:border-gray-600 rounded-l-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
            disabled={isProcessing}
          />
          <Button 
            className="bg-primary hover:bg-primary/90 text-white rounded-r-lg"
            onClick={handleSendQuery}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <SendIcon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
