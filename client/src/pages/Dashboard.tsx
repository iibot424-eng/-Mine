import { StatsGrid } from "@/components/StatsGrid";
import { ControlPanel } from "@/components/ControlPanel";
import { Terminal } from "@/components/Terminal";
import { ConfigForm } from "@/components/ConfigForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal as TerminalIcon, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 relative overflow-hidden">
      {/* CRT Scanline Overlay */}
      <div className="scanline absolute inset-0 pointer-events-none z-50" />
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-primary/30 pb-4">
        <div className="flex flex-col md:flex-row items-baseline gap-4">
          <h1 className="text-4xl md:text-6xl font-tech text-primary tracking-tighter text-glow">
            ANARCHY_OS
          </h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => logout()}
            className="text-primary/60 hover:text-primary hover:bg-primary/10 rounded-none font-tech text-xs flex items-center gap-2 border border-primary/20 h-7"
          >
            <LogOut className="w-3 h-3" />
            DISCONNECT_SESSION
          </Button>
        </div>
        <div className="text-right font-mono text-xs text-primary/60">
          SYSTEM_ID: BOT-8821<br />
          SECURITY_LEVEL: ROOT
        </div>
      </header>

      {/* Main Stats */}
      <section>
        <StatsGrid />
      </section>

      {/* Control Panel */}
      <section>
        <ControlPanel />
      </section>

      {/* Tabs */}
      <section>
        <Tabs defaultValue="console" className="w-full">
          <TabsList className="bg-transparent border-b border-primary/20 w-full justify-start rounded-none p-0 h-auto gap-1">
            <TabsTrigger 
              value="console"
              className="rounded-none border-t border-x border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-tech px-6 py-3"
            >
              <TerminalIcon className="w-4 h-4 mr-2" /> CONSOLE
            </TabsTrigger>
            <TabsTrigger 
              value="config"
              className="rounded-none border-t border-x border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-tech px-6 py-3"
            >
              <Settings className="w-4 h-4 mr-2" /> CONFIGURATION
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="console" className="m-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Terminal />
              </motion.div>
            </TabsContent>
            
            <TabsContent value="config" className="m-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ConfigForm />
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </section>
      
      {/* Footer Decoration */}
      <footer className="fixed bottom-2 right-2 text-[10px] text-primary/20 font-mono pointer-events-none">
        ENCRYPTED CONNECTION ESTABLISHED
      </footer>
    </div>
  );
}
