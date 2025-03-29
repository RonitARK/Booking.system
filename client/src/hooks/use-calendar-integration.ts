import { useQuery, useMutation } from "@tanstack/react-query";
import { CalendarIntegration, InsertCalendarIntegration } from "@shared/schema";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

// Interface for sanitized calendar integrations returned to client
interface SanitizedCalendarIntegration {
  id: number;
  provider: string;
  connected: boolean;
  createdAt: Date;
}

export function useCalendarIntegrations() {
  const { isAuthenticated } = useAuth();
  
  return useQuery<SanitizedCalendarIntegration[]>({
    queryKey: ['/api/calendar-integrations'],
    enabled: isAuthenticated,
    staleTime: 60000, // 1 minute
  });
}

export function useAddCalendarIntegration() {
  const mutation = useMutation({
    mutationFn: async (integration: Omit<InsertCalendarIntegration, "userId">) => {
      const response = await apiRequest("POST", '/api/calendar-integrations', integration);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-integrations'] });
    }
  });
  
  return mutation;
}

export function useDeleteCalendarIntegration() {
  const mutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/calendar-integrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-integrations'] });
    }
  });
  
  return mutation;
}
