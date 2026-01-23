import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type BotConfig } from "@shared/schema";
import { useEffect, useState } from "react";
import { Loader2, Save, Cpu, Shield, ShoppingCart, User, Server, Plus, Trash2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const configSchema = z.object({
  name: z.string().min(1, "Profile name is required"),
  serverIp: z.string().min(1, "Server IP is required"),
  serverPort: z.number().int().min(1).max(65535),
  username: z.string().min(1, "Username is required"),
  authType: z.string(),
  version: z.string().optional(),
  masterName: z.string().optional(),
  isBedrock: z.boolean().default(false),
  isAutoFarm: z.boolean().default(false),
  isAutoDefense: z.boolean().default(false),
  isAutoTrade: z.boolean().default(false),
});

type InsertBotConfig = z.infer<typeof configSchema>;

export function ConfigForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  const { data: config, isLoading } = useQuery<BotConfig[]>({
    queryKey: ["/api/config"],
  });

  const currentConfig = config?.find(c => c.id === selectedProfileId) || config?.[0];

  const form = useForm<InsertBotConfig>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      name: "New Profile",
      serverIp: "localhost",
      serverPort: 25565,
      username: "Bot",
      authType: "offline",
      masterName: "",
      isAutoFarm: false,
      isAutoDefense: false,
      isAutoTrade: false,
      version: "1.20.1",
      isBedrock: false,
    },
  });

  useEffect(() => {
    if (currentConfig) {
      form.reset({
        name: currentConfig.name || "Default Profile",
        serverIp: currentConfig.serverIp,
        serverPort: currentConfig.serverPort,
        username: currentConfig.username,
        authType: currentConfig.authType,
        version: currentConfig.version || "1.20.1",
        masterName: currentConfig.masterName || "",
        isBedrock: currentConfig.isBedrock || false,
        isAutoFarm: currentConfig.isAutoFarm || false,
        isAutoDefense: currentConfig.isAutoDefense || false,
        isAutoTrade: currentConfig.isAutoTrade || false,
      });
      setSelectedProfileId(currentConfig.id);
      localStorage.setItem('selectedProfileId', currentConfig.id.toString());
    }
  }, [currentConfig, form]);

  const { mutate: updateConfig, isPending } = useMutation({
    mutationFn: async (data: InsertBotConfig) => {
      const url = selectedProfileId ? `/api/config?id=${selectedProfileId}` : '/api/config';
      const res = await apiRequest("POST", url, data);
      return res.ok ? await res.json() : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({ title: "Configuration matrix updated", description: "Profile saved successfully." });
    }
  });

  const { mutate: deleteProfile } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/config/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({ title: "Profile deleted" });
      setSelectedProfileId(null);
    }
  });

  if (isLoading) return <div className="text-primary animate-pulse font-mono p-8 text-center uppercase">Loading_Profiles...</div>;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap items-center">
        {config?.map(profile => (
          <div key={profile.id} className="flex items-center gap-1">
            <Button
              variant={selectedProfileId === profile.id ? "default" : "outline"}
              onClick={() => setSelectedProfileId(profile.id)}
              className="font-mono h-8 rounded-none border-primary/20"
            >
              {profile.name}
            </Button>
            {config && config.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteProfile(profile.id)}
                className="text-destructive h-8 w-8 hover:bg-destructive/10 rounded-none"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button 
          variant="outline" 
          size="sm"
          className="border-dashed border-primary/40 rounded-none h-8 font-tech"
          onClick={() => {
            setSelectedProfileId(null);
            form.reset({
              name: "New Profile",
              serverIp: "localhost",
              serverPort: 25565,
              username: "Bot",
              authType: "offline",
              masterName: "",
              isAutoFarm: false,
              isAutoDefense: false,
              isAutoTrade: false,
              version: "1.20.1",
              isBedrock: false,
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          ADD_PROFILE
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            updateConfig(data);
          })}
          className="space-y-6"
        >
          <Card className="bg-card/50 border-primary/20 rounded-none">
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Profile_Alias</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-black/50 border-primary/30 font-mono text-primary rounded-none focus:border-primary shadow-[inset_0_0_10px_rgba(0,255,65,0.05)]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-primary/20 rounded-none">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-4 text-primary font-tech border-b border-primary/20 pb-2 uppercase tracking-tighter">
                  <Server className="w-4 h-4" /> Server_Parameters
                </div>
                
                <FormField
                  control={form.control}
                  name="serverIp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Target_IP</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-black/50 border-primary/30 font-mono text-primary rounded-none focus:border-primary h-8" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="serverPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Port</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            className="bg-black/50 border-primary/30 font-mono text-primary rounded-none focus:border-primary h-8" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Protocol</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value || "1.20.1"}>
                            <SelectTrigger className="bg-black/50 border-primary/30 font-mono text-primary rounded-none focus:border-primary h-8">
                              <SelectValue placeholder="Protocol" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-primary text-primary font-mono rounded-none">
                              <SelectItem value="1.21.4">1.21.4</SelectItem>
                              <SelectItem value="1.21.3">1.21.3</SelectItem>
                              <SelectItem value="1.21.1">1.21.1</SelectItem>
                              <SelectItem value="1.21">1.21</SelectItem>
                              <SelectItem value="1.21.30">1.21.30 (Bedrock)</SelectItem>
                              <SelectItem value="1.21.2">1.21.2</SelectItem>
                              <SelectItem value="1.20.1">1.20.1</SelectItem>
                              <SelectItem value="1.19.4">1.19.4</SelectItem>
                              <SelectItem value="1.18.2">1.18.2</SelectItem>
                              <SelectItem value="1.16.5">1.16.5</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-primary/20 rounded-none">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-4 text-primary font-tech border-b border-primary/20 pb-2 uppercase tracking-tighter">
                  <User className="w-4 h-4" /> Identity_Module
                </div>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Bot_Alias</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-black/50 border-primary/30 font-mono text-primary rounded-none focus:border-primary h-8" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Auth_Protocol</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value || "offline"}>
                          <SelectTrigger className="bg-black/50 border-primary/30 font-mono text-primary rounded-none focus:border-primary h-8">
                            <SelectValue placeholder="Auth Method" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-primary text-primary font-mono rounded-none">
                            <SelectItem value="offline">OFFLINE (Cracked)</SelectItem>
                            <SelectItem value="microsoft">MICROSOFT (Official)</SelectItem>
                            <SelectItem value="bedrock">BEDROCK (Mobile/Console)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isBedrock"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-none border border-primary/20 p-2 bg-black/30">
                      <FormLabel className="text-[10px] font-mono text-primary uppercase tracking-widest">Bedrock_Protocol</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="scale-75 data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 border-primary/20 rounded-none">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-6 text-primary font-tech border-b border-primary/20 pb-2 uppercase tracking-tighter">
                <Cpu className="w-4 h-4" /> Automation_Subroutines
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="isAutoFarm"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-none border border-primary/20 p-4 bg-black/30">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-mono text-primary uppercase">Auto_Farm</FormLabel>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-tighter">Harvest Logic</div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAutoDefense"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-none border border-primary/20 p-4 bg-black/30">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-mono text-destructive uppercase">Defense</FormLabel>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-tighter">Combat Mode</div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-destructive"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAutoTrade"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-none border border-primary/20 p-4 bg-black/30">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-mono text-yellow-500 uppercase">Trade</FormLabel>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-tighter">Economy Link</div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-yellow-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-primary text-black hover:bg-primary/80 font-bold font-tech rounded-none px-12 h-12 text-xl tracking-tighter uppercase"
            >
              {isPending ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Save className="w-6 h-6 mr-2" />}
              Commit_Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
