import { useQuery } from "@tanstack/react-query";
import { Appointment } from "@shared/schema";
import { format } from "date-fns";
import { useAuth } from "@/context/auth-context";

interface AppointmentFilters {
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

export function useAppointments(filters: AppointmentFilters = {}) {
  const { isAuthenticated } = useAuth();
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  
  if (filters.startDate) {
    queryParams.append('startDate', filters.startDate.toISOString());
  }
  
  if (filters.endDate) {
    queryParams.append('endDate', filters.endDate.toISOString());
  }
  
  if (filters.status) {
    queryParams.append('status', filters.status);
  }
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  return useQuery<Appointment[]>({
    queryKey: ['/api/appointments', queryString],
    enabled: isAuthenticated,
    staleTime: 30000, // 30 seconds
  });
}
