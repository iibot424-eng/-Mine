import { useBotConfig, useUpdateConfig } from "@/hooks/use-bot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBotConfigSchema, type InsertBotConfig } from "@shared/schema";
import { useEffect } from "react";
import { Loader2, Save, Cpu, Shield, ShoppingCart, User, Server } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ConfigForm() {
  const { data: config, isLoading } = useBotConfig();
  const { mutate: updateConfig, isPending } = useUpdateConfig();

  const form = useForm<InsertBotConfig>({
    resolver: zodResolver(insertBotConfigSchema),
    defaultValues: {
      serverIp: "localhost",
      serverPort: 25565,
      username: "Bot",
      authType: "offline",
      masterName: "",
      isAutoFarm: false,
      isAutoDefense: false,
      isAutoTrade: false,
      version: "1.20.1",
    },
  });

  // Reset form when data loads
  useEffect(() => {
    if (config) {
      form.reset(config);
    }
  }, [config, form]);

  if (isLoading) return <div className="text-primary animate-pulse font-mono">Loading configuration matrix...</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => updateConfig(data))} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* SERVER CONNECTION */}
          <Card className="bg-card/50 border-primary/20 rounded-none">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4 text-primary font-tech border-b border-primary/20 pb-2">
                <Server className="w-4 h-4" /> SERVER_PARAMETERS
              </div>
              
              <FormField
                control={form.control}
                name="serverIp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs text-muted-foreground">TARGET_IP</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-black/50 border-primary/30 font-mono text-primary rounded-none focus:border-primary" />
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
                      <FormLabel className="font-mono text-xs text-muted-foreground">PORT</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                          className="bg-black/50 border-primary/30 font-mono text-primary rounded-none focus:border-primary" 
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
                      <FormLabel className="font-mono text-xs text-muted-foreground">PROTOCOL</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value || "1.20.1"}>
                          <SelectTrigger className="bg-black/50 border-primary/30 font-mono text-primary rounded-none focus:border-primary">
                            <SelectValue placeholder="Select version" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-primary text-primary font-mono rounded-none">
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

          {/* IDENTITY */}
          <Card className="bg-card/50 border-primary/20 rounded-none">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-4 text-primary font-tech border-b border-primary/20 pb-2">
                <User className="w-4 h-4" /> IDENTITY_MODULE
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs text-muted-foreground">BOT_ALIAS</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-black/50 border-primary/30 font-mono text-primary rounded-none focus:border-primary" />
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
                    <FormLabel className="font-mono text-xs text-muted-foreground">AUTH_PROTOCOL</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="bg-black/50 border-primary/30 font-mono text-primary rounded-none focus:border-primary">
                          <SelectValue placeholder="Select auth type" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-primary text-primary font-mono rounded-none">
                          <SelectItem value="offline">OFFLINE (Cracked)</SelectItem>
                          <SelectItem value="microsoft">MICROSOFT (Official)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="masterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs text-muted-foreground">COMMANDER_ID</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ""} 
                        placeholder="Player to obey..."
                        className="bg-black/50 border-primary/30 font-mono text-primary rounded-none focus:border-primary" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* AUTOMATION MODULES */}
        <Card className="bg-card/50 border-primary/20 rounded-none">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-6 text-primary font-tech border-b border-primary/20 pb-2">
              <Cpu className="w-4 h-4" /> AUTOMATION_SUBROUTINES
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="isAutoFarm"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-none border border-primary/20 p-4 bg-black/30">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-mono text-primary flex items-center gap-2">
                        <Cpu className="w-4 h-4" /> AUTO_FARM
                      </FormLabel>
                      <div className="text-[10px] text-muted-foreground">Resource acquisition logic</div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-secondary"
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
                      <FormLabel className="text-base font-mono text-destructive flex items-center gap-2">
                        <Shield className="w-4 h-4" /> DEFENSE
                      </FormLabel>
                      <div className="text-[10px] text-muted-foreground">Combat & evasion logic</div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-destructive data-[state=unchecked]:bg-secondary"
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
                      <FormLabel className="text-base font-mono text-yellow-500 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> TRADE
                      </FormLabel>
                      <div className="text-[10px] text-muted-foreground">Economy interaction logic</div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-secondary"
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
            className="bg-primary text-black hover:bg-primary/80 font-bold font-tech rounded-none px-8 text-lg"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            COMMIT CHANGES
          </Button>
        </div>
      </form>
    </Form>
  );
}
