import { Appointment } from "@shared/schema";

// This would be an actual OpenAI client in a real implementation
// For this MVP, we'll simulate AI responses

type AiSuggestionInput = {
  userId: number;
  date: Date;
  appointments: Appointment[];
  userRole: string;
};

type TimeSlot = {
  startTime: string;
  endTime: string;
  score: number;
  reason: string;
};

type AiSuggestionOutput = {
  recommended_slots: TimeSlot[];
  insights: string[];
  no_show_risks: {
    appointmentId: number;
    risk: number;
    reason: string;
  }[];
};

export async function generateAiSuggestions(
  input: AiSuggestionInput
): Promise<AiSuggestionOutput> {
  // In a real implementation, this would call OpenAI API
  // For now, simulate the AI response with realistic scheduling logic
  
  const { date, appointments, userRole } = input;
  
  // Business hours: 8 AM to 6 PM
  const businessHourStart = 8; // 8 AM
  const businessHourEnd = 18; // 6 PM
  
  // Generate available time slots (30-minute intervals)
  const timeSlots: TimeSlot[] = [];
  const dateStr = date.toISOString().split('T')[0];
  
  // Get appointments for the requested date
  const dayAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.startTime);
    return (
      appointmentDate.getDate() === date.getDate() &&
      appointmentDate.getMonth() === date.getMonth() &&
      appointmentDate.getFullYear() === date.getFullYear()
    );
  });
  
  // Find busy time ranges
  const busyRanges: { start: number; end: number }[] = dayAppointments.map(
    appointment => ({
      start: appointment.startTime.getHours() + appointment.startTime.getMinutes() / 60,
      end: appointment.endTime.getHours() + appointment.endTime.getMinutes() / 60
    })
  );
  
  // Common meeting durations
  const commonDurations = [0.5, 1, 1.5]; // in hours
  
  // Generate available slots
  for (let hour = businessHourStart; hour < businessHourEnd; hour += 0.5) {
    for (const duration of commonDurations) {
      const slotEnd = hour + duration;
      
      if (slotEnd > businessHourEnd) {
        continue; // Skip if slot extends beyond business hours
      }
      
      // Check if slot conflicts with any existing appointment
      const isConflict = busyRanges.some(
        range => (hour < range.end && slotEnd > range.start)
      );
      
      if (!isConflict) {
        // Format time strings
        const startHour = Math.floor(hour);
        const startMinute = (hour - startHour) * 60;
        const endHour = Math.floor(slotEnd);
        const endMinute = (slotEnd - endHour) * 60;
        
        const startTime = `${dateStr}T${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`;
        const endTime = `${dateStr}T${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;
        
        // Generate a score and reason (this would be AI-powered in a real implementation)
        let score = 0;
        let reason = "";
        
        // Prefer morning slots for important meetings
        if (hour < 12) {
          score += 0.2;
          reason = "Morning slots are typically better for focused work.";
        }
        
        // Avoid lunch time
        if (hour >= 12 && hour < 13.5) {
          score -= 0.3;
          reason = "This is around typical lunch time, which might be inconvenient.";
        }
        
        // Avoid end of day for longer meetings
        if (duration > 1 && slotEnd > 16) {
          score -= 0.2;
          reason = "Longer meetings late in the day can be less productive.";
        }
        
        // Prefer standard meeting durations
        if (duration === 0.5 || duration === 1) {
          score += 0.1;
          reason = `${duration * 60} minute meetings are standard and typically efficient.`;
        }
        
        // Prefer buffer time between meetings
        const hasBufferBefore = !busyRanges.some(range => Math.abs(range.end - hour) < 0.25);
        const hasBufferAfter = !busyRanges.some(range => Math.abs(range.start - slotEnd) < 0.25);
        
        if (hasBufferBefore && hasBufferAfter) {
          score += 0.3;
          reason = "This slot has buffer time before and after, reducing stress between meetings.";
        }
        
        // Add a bit of randomness to make it interesting
        score += Math.random() * 0.2;
        
        // Normalize score between 0 and 1
        score = Math.min(1, Math.max(0, 0.5 + score));
        
        timeSlots.push({
          startTime,
          endTime,
          score,
          reason
        });
      }
    }
  }
  
  // Sort by score and take top recommendations
  const recommendedSlots = timeSlots
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  
  // Generate insights
  const insights = [
    "Your meeting load is optimally balanced this week",
    "Consider scheduling focused work time in the mornings",
    "You have several meetings scheduled without proper breaks"
  ];
  
  // Identify potential no-shows (for a real implementation, this would use ML models)
  const noShowRisks = dayAppointments
    .filter(_ => Math.random() > 0.7) // Randomly select some appointments
    .map(appointment => ({
      appointmentId: appointment.id,
      risk: Math.random() * 0.7 + 0.3, // Random risk between 0.3 and 1
      reason: "Client has missed previous appointments"
    }));
  
  return {
    recommended_slots: recommendedSlots,
    insights,
    no_show_risks: noShowRisks
  };
}
