import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertAppointmentSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/auth-context";
import { useAiSuggestions } from "@/hooks/use-ai-suggestions";
import { LightbulbIcon } from "lucide-react";

// Extend the insert schema with additional validation
const appointmentFormSchema = insertAppointmentSchema.extend({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  appointmentToEdit?: any;
}

export default function AppointmentForm({ 
  isOpen, 
  onClose, 
  initialDate,
  appointmentToEdit 
}: AppointmentFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { generateSuggestion, aiSuggestion } = useAiSuggestions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues: Partial<AppointmentFormValues> = {
    title: "",
    location: "",
    notes: "",
    status: "scheduled",
    color: "#3b82f6" // Default blue
  };
  
  // If editing appointment, set initial values
  useEffect(() => {
    if (appointmentToEdit) {
      form.reset({
        title: appointmentToEdit.title,
        startTime: new Date(appointmentToEdit.startTime).toISOString().slice(0, 16),
        endTime: new Date(appointmentToEdit.endTime).toISOString().slice(0, 16),
        clientId: appointmentToEdit.clientId,
        staffId: appointmentToEdit.staffId,
        location: appointmentToEdit.location || "",
        notes: appointmentToEdit.notes || "",
        status: appointmentToEdit.status,
        color: appointmentToEdit.color
      });
    } else if (initialDate) {
      // Format initialDate to ISO string for datetime-local input
      const startTime = new Date(initialDate);
      const endTime = new Date(initialDate);
      endTime.setHours(endTime.getHours() + 1);
      
      form.reset({
        ...defaultValues,
        startTime: startTime.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16),
        staffId: user?.role === "staff" || user?.role === "admin" ? user.id : undefined
      });
    }
  }, [appointmentToEdit, initialDate, isOpen]);
  
  // Request AI suggestion when form opens with an initial date
  useEffect(() => {
    if (isOpen && initialDate && !appointmentToEdit) {
      generateSuggestion(initialDate);
    }
  }, [isOpen, initialDate]);
  
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues
  });
  
  const onSubmit = async (data: AppointmentFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convert string dates to ISO strings
      const formattedData = {
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString()
      };
      
      if (appointmentToEdit) {
        // Update existing appointment
        await apiRequest("PUT", `/api/appointments/${appointmentToEdit.id}`, formattedData);
        toast({
          title: "Appointment updated",
          description: "Your appointment has been updated successfully."
        });
      } else {
        // Create new appointment
        await apiRequest("POST", "/api/appointments", formattedData);
        toast({
          title: "Appointment created",
          description: "Your appointment has been created successfully."
        });
      }
      
      // Invalidate appointments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const applyAiSuggestion = () => {
    if (aiSuggestion && aiSuggestion.recommended_slots && aiSuggestion.recommended_slots.length > 0) {
      const suggestion = aiSuggestion.recommended_slots[0];
      
      form.setValue('startTime', suggestion.startTime.slice(0, 16));
      form.setValue('endTime', suggestion.endTime.slice(0, 16));
      
      toast({
        title: "AI suggestion applied",
        description: suggestion.reason
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {appointmentToEdit ? "Edit Appointment" : "New Appointment"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Meeting title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {user?.role === "admin" && (
              <FormField
                control={form.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Staff</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Sarah Johnson</SelectItem>
                        <SelectItem value="2">John Davis</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {(user?.role === "admin" || user?.role === "staff") && (
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="3">Michael Thompson</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Meeting location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional details" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex space-x-2">
                    {["#3b82f6", "#8b5cf6", "#10b981", "#f97316", "#ef4444"].map((color) => (
                      <div 
                        key={color}
                        className={`w-8 h-8 rounded-full cursor-pointer ${field.value === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => field.onChange(color)}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {aiSuggestion && aiSuggestion.recommended_slots && aiSuggestion.recommended_slots.length > 0 && (
              <div className="flex items-center space-x-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-dashed border-orange-500 rounded-lg">
                <LightbulbIcon className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    AI suggests: {new Date(aiSuggestion.recommended_slots[0].startTime).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {aiSuggestion.recommended_slots[0].reason}
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={applyAiSuggestion}
                >
                  Apply
                </Button>
              </div>
            )}
          </form>
        </Form>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {appointmentToEdit ? "Update" : "Create"} Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
