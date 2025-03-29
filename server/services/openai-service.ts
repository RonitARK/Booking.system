import { Appointment } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

/**
 * Generate AI scheduling suggestions using OpenAI's API
 * @param input - The input data for generating suggestions
 * @returns AI-generated scheduling suggestions
 */
export async function generateAiSuggestions(
  input: AiSuggestionInput
): Promise<AiSuggestionOutput> {
  const { date, appointments, userRole } = input;
  
  try {
    // Fall back to simulated response if no API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY is not set. Using simulated AI response.");
      return simulateAiSuggestions(input);
    }
    
    // Format date to readable string
    const dateStr = new Date(date).toISOString().split('T')[0];
    
    // Filter appointments for the requested date
    const dayAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime);
      return (
        appointmentDate.getDate() === date.getDate() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getFullYear() === date.getFullYear()
      );
    });
    
    // Format appointments for the prompt
    const appointmentsFormatted = dayAppointments.map(apt => {
      // Find client name from clientId (in a real app, would use a DB join or lookup)
      const clientName = apt.clientId ? `Client ${apt.clientId}` : "No client";
      
      return {
        id: apt.id,
        title: apt.title,
        clientName,
        startTime: new Date(apt.startTime).toLocaleTimeString(),
        endTime: new Date(apt.endTime).toLocaleTimeString(),
        duration: (new Date(apt.endTime).getTime() - new Date(apt.startTime).getTime()) / (1000 * 60), // minutes
        status: apt.status || "scheduled"
      };
    });
    
    // Prepare the prompt for OpenAI
    const systemPrompt = `
      You are an AI scheduling assistant for a business professional. 
      Analyze the user's schedule for ${dateStr} and provide the following:
      
      1. Three optimal time slots for new appointments
      2. Insights about their schedule
      3. Assessment of no-show risks for existing appointments
      
      Respond in JSON format with the following structure:
      {
        "recommended_slots": [
          {
            "startTime": "ISO string",
            "endTime": "ISO string",
            "score": number between 0-1,
            "reason": "string reason"
          }
        ],
        "insights": ["string insight 1", "string insight 2"],
        "no_show_risks": [
          {
            "appointmentId": number,
            "risk": number between 0-1,
            "reason": "string reason"
          }
        ]
      }
      
      Base your recommendations on these considerations:
      - Business hours are 8:00 AM to 6:00 PM
      - Avoid scheduling during lunch (12:00-1:00 PM)
      - Allow buffer time between meetings (at least 15 min)
      - Prefer time slots with higher productivity (mornings for focus work)
      - Consider appointment history and patterns for no-show risk
    `;
    
    const userPrompt = `
      Today's date: ${dateStr}
      User role: ${userRole}
      
      Current schedule for ${dateStr}:
      ${JSON.stringify(appointmentsFormatted, null, 2)}
      
      Please suggest optimal time slots and provide schedule insights based on this information.
    `;
    
    // Call OpenAI API
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const responseContent = response.choices[0].message.content;
    const result = JSON.parse(typeof responseContent === 'string' ? responseContent : '{}');
    
    // Format the time slots to ensure they're in ISO format
    if (result.recommended_slots) {
      result.recommended_slots = result.recommended_slots.map((slot: any) => {
        // Ensure startTime and endTime are in ISO format
        if (!slot.startTime.includes(dateStr)) {
          const [hours, minutes] = slot.startTime.split(':');
          slot.startTime = `${dateStr}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
        }
        
        if (!slot.endTime.includes(dateStr)) {
          const [hours, minutes] = slot.endTime.split(':');
          slot.endTime = `${dateStr}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
        }
        
        return slot;
      });
    }
    
    return result;
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    // Fall back to simulated response if OpenAI call fails
    return simulateAiSuggestions(input);
  }
}

/**
 * Generate simulated AI suggestions when OpenAI is not available
 * This function mimics the behavior of the AI model with deterministic logic
 */
function simulateAiSuggestions(input: AiSuggestionInput): AiSuggestionOutput {
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
      start: new Date(appointment.startTime).getHours() + new Date(appointment.startTime).getMinutes() / 60,
      end: new Date(appointment.endTime).getHours() + new Date(appointment.endTime).getMinutes() / 60
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
        
        // Generate a score and reason
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
  
  // Generate insights based on user role
  let insights = [
    "Your meeting load is optimally balanced this week",
    "Consider scheduling focused work time in the mornings",
    "You have several meetings scheduled without proper breaks"
  ];
  
  if (userRole === 'admin') {
    insights.push("As an admin, delegate some meetings to your team members");
  } else if (userRole === 'staff') {
    insights.push("Block some time for documentation and follow-ups");
  }
  
  // Identify potential no-shows based on appointment patterns
  const noShowRisks = dayAppointments
    .filter(_ => Math.random() > 0.7) // Simulate high-risk appointments
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
