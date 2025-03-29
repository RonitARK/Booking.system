import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AiSuggestion } from "@shared/schema";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export function useAiSuggestions() {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  
  // Query for getting existing AI suggestions
  const { data: suggestions } = useQuery<AiSuggestion[]>({
    queryKey: ['/api/ai-suggestions'],
    enabled: isAuthenticated,
    staleTime: 60000, // 1 minute
  });
  
  // Mutation for generating a new AI suggestion
  const generateMutation = useMutation({
    mutationFn: async (date: Date) => {
      const response = await apiRequest("POST", '/api/ai-suggestions/generate', {
        date: date.toISOString()
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-suggestions'] });
      setAiSuggestion(data.suggestion);
    }
  });
  
  // Mutation for marking a suggestion as used
  const useSuggestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/ai-suggestions/${id}/use`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-suggestions'] });
    }
  });
  
  // Function to generate a suggestion for a specific date
  const generateSuggestion = async (date: Date) => {
    setIsLoading(true);
    try {
      const result = await generateMutation.mutateAsync(date);
      return result;
    } catch (error) {
      // Silent fail, errors are handled by the caller
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to mark a suggestion as used
  const useSuggestion = async (id: number) => {
    try {
      await useSuggestionMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to mark AI suggestion as used:", error);
    }
  };
  
  return {
    suggestions,
    aiSuggestion,
    isLoading: isLoading || generateMutation.isPending,
    generateSuggestion,
    useSuggestion
  };
}
