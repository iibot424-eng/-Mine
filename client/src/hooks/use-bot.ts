import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type errorSchemas } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// === TYPES ===
// Inferring types directly from the API schema for type safety
type BotStatus = z.infer<typeof api.bot.status.responses[200]>;
type BotConfigResponse = z.infer<typeof api.config.get.responses[200]>;
type UpdateConfigInput = z.infer<typeof api.config.update.input>;
type ChatInput = z.infer<typeof api.bot.chat.input>;

// === HOOKS ===

export function useBotConfig() {
  return useQuery<BotConfig[]>({
    queryKey: ["/api/config"],
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/config", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "Configuration updated",
        description: "Your bot settings have been saved.",
      });
    },
  });
}

export function useBotStatus() {
  return useQuery({
    queryKey: [api.bot.status.path],
    queryFn: async () => {
      const res = await fetch(api.bot.status.path);
      if (!res.ok) throw new Error("Failed to fetch status");
      return api.bot.status.responses[200].parse(await res.json());
    },
    refetchInterval: 1000, // Poll every second for real-time feel
  });
}

export function useStartBot() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id?: number) => {
      const url = id ? `${api.bot.start.path}?id=${id}` : api.bot.start.path;
      const res = await fetch(url, {
        method: api.bot.start.method,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to start bot");
      }
      return api.bot.start.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bot.status.path] });
      toast({
        title: "SEQUENCE INITIATED",
        description: "Bot connection sequence started.",
        className: "border-primary text-primary bg-black font-mono",
      });
    },
    onError: (error) => {
      toast({
        title: "INITIATION FAILED",
        description: error.message,
        variant: "destructive",
        className: "font-mono",
      });
    },
  });
}

export function useStopBot() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.bot.stop.path, {
        method: api.bot.stop.method,
      });
      
      if (!res.ok) throw new Error("Failed to stop bot");
      return api.bot.stop.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bot.status.path] });
      toast({
        title: "SEQUENCE TERMINATED",
        description: "Bot disconnected successfully.",
        className: "border-destructive text-destructive bg-black font-mono",
      });
    },
  });
}

export function useSendChat() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ChatInput) => {
      const res = await fetch(api.bot.chat.path, {
        method: api.bot.chat.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error("Failed to send message");
      return api.bot.chat.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "TRANSMISSION ERROR",
        description: error.message,
        variant: "destructive",
        className: "font-mono",
      });
    },
  });
}
