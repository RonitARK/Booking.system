import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString(undefined, { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export function formatDateShort(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric'
  });
}

// Calculate time in minutes since start of day
export function timeToMinutes(time: Date): number {
  return time.getHours() * 60 + time.getMinutes();
}

// Convert minutes to a time string (e.g. 510 -> "8:30 AM")
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

// Determine appointment position in day view
export function getAppointmentPosition(
  startTime: Date,
  endTime: Date,
  dayStartHour: number = 8,
  hourHeight: number = 80
): { top: number; height: number } {
  const dayStartMinutes = dayStartHour * 60;
  const startMinutes = timeToMinutes(startTime) - dayStartMinutes;
  const endMinutes = timeToMinutes(endTime) - dayStartMinutes;
  
  // Convert to pixels
  const top = (startMinutes / 60) * hourHeight;
  const height = ((endMinutes - startMinutes) / 60) * hourHeight;
  
  return { top, height };
}

// Generate a readable color based on a string (consistent color for the same string)
export function getColorFromString(str: string): string {
  // Pre-defined colors for appointments
  const colors = [
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#10b981", // green
    "#f97316", // orange
    "#ef4444", // red
    "#06b6d4", // cyan
    "#ec4899", // pink
  ];
  
  // Simple hash function to get a consistent index
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use absolute value and modulo to get an index within the colors array
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Calculate the duration between two dates in minutes
export function getDurationInMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

// Format duration in a human-readable way
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

// Check if two time ranges overlap
export function doTimesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && end1 > start2;
}
