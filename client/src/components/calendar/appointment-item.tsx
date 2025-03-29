import { useState, CSSProperties } from "react";
import { Appointment } from "@shared/schema";
import { formatTime, formatDuration, getDurationInMinutes } from "@/lib/utils";
import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface AppointmentItemProps {
  appointment: Appointment;
  style?: CSSProperties;
  compact?: boolean;
  onClick?: (appointment: Appointment) => void;
}

export default function AppointmentItem({ 
  appointment, 
  style, 
  compact = false,
  onClick 
}: AppointmentItemProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime);
  const duration = getDurationInMinutes(startTime, endTime);
  
  const getBorderColor = () => {
    return appointment.color;
  };
  
  const getBackgroundColor = () => {
    return `${appointment.color}10`; // Add 10% opacity
  };
  
  const getTextColor = () => {
    return appointment.color;
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick(appointment);
    } else {
      setIsDetailsOpen(true);
    }
  };
  
  const getBadgeClasses = () => {
    let baseClasses = "text-xs px-2 py-0.5 rounded";
    
    // Add color specific classes
    if (appointment.color === "#3b82f6") { // blue
      return `${baseClasses} bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200`;
    } else if (appointment.color === "#8b5cf6") { // purple
      return `${baseClasses} bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200`;
    } else if (appointment.color === "#10b981") { // green
      return `${baseClasses} bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200`;
    } else if (appointment.color === "#f97316") { // orange
      return `${baseClasses} bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200`;
    } else if (appointment.color === "#ef4444") { // red
      return `${baseClasses} bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200`;
    } else {
      return `${baseClasses} bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200`;
    }
  };
  
  return (
    <>
      <div 
        className="absolute z-10 rounded-lg border-l-4 p-3 cursor-pointer"
        style={{
          ...style,
          borderLeftColor: getBorderColor(),
          backgroundColor: getBackgroundColor(),
          color: getTextColor()
        }}
        onClick={handleClick}
        draggable={true}
        data-appointment-id={appointment.id}
      >
        {compact ? (
          <div className="truncate font-medium text-sm">{appointment.title}</div>
        ) : (
          <>
            <div className="flex justify-between">
              <h4 className="font-medium">{appointment.title}</h4>
              <span className={getBadgeClasses()}>{formatDuration(duration)}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {appointment.clientId ? "Michael Thompson" : "Internal"}
            </p>
            {appointment.location && (
              <div className="flex items-center space-x-1 mt-2">
                <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{appointment.location}</span>
              </div>
            )}
          </>
        )}
      </div>
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{appointment.title}</DialogTitle>
            <DialogDescription>
              {format(startTime, "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Time</div>
              <div>{formatTime(startTime)} - {formatTime(endTime)} ({formatDuration(duration)})</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="font-medium">Location</div>
              <div>{appointment.location || "Not specified"}</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="font-medium">Client</div>
              <div>{appointment.clientId ? "Michael Thompson" : "Internal"}</div>
            </div>
            
            {appointment.notes && (
              <div>
                <div className="font-medium mb-1">Notes</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  {appointment.notes}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="font-medium">Status</div>
              <div className="capitalize">{appointment.status}</div>
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
            <Button variant="destructive">Cancel Appointment</Button>
            <Button>Edit Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
