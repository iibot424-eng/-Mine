import { useEffect, useRef, useState } from "react";
import { useLogs, useClearLogs } from "@/hooks/use-logs";
import { useSendChat } from "@/hooks/use-bot";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Send, Terminal as TerminalIcon } from "lucide-react";
import { format } from "date-fns";

export function Terminal() {
  const { data: logs, isLoading } = useLogs();
  const { mutate: clearLogs } = useClearLogs();
  const { mutate: sendChat, isPending: isSending } = useSendChat();
  
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Optimistically show command in log? Or just wait for polling?
    // Let's just send it.
    sendChat({ message: input });
    setInput("");
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-destructive';
      case 'warning': return 'text-yellow-500';
      case 'chat': return 'text-blue-400';
      default: return 'text-primary';
    }
  };

  return (
    <Card className="bg-black/80 border-primary/50 rounded-none shadow-[inset_0_0_20px_rgba(0,255,0,0.05)] flex flex-col h-[500px]">
      <div className="flex items-center justify-between p-3 border-b border-primary/20 bg-secondary/20">
        <div className="flex items-center gap-2 text-primary font-tech text-sm">
          <TerminalIcon className="w-4 h-4" />
          <span>SYSTEM_LOGS // STREAM_ACTIVE</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => clearLogs()}
          className="h-6 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-mono rounded-none"
        >
          <Trash2 className="w-3 h-3 mr-1" /> CLEAR
        </Button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1 terminal-scrollbar"
      >
        {isLoading ? (
          <div className="text-primary/50 animate-pulse">Initializing data stream...</div>
        ) : logs?.length === 0 ? (
          <div className="text-muted-foreground opacity-50 italic">No system logs recorded.</div>
        ) : (
          logs?.map((log, i) => (
            <div key={i} className="flex gap-3 hover:bg-white/5 px-1 py-0.5 transition-colors">
              <span className="text-muted-foreground shrink-0 text-xs py-0.5">
                [{format(new Date(log.timestamp), 'HH:mm:ss')}]
              </span>
              <span className={`${getLogColor(log.type)} break-all`}>
                {log.type === 'chat' && <span className="opacity-70 mr-2">{'>'}</span>}
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-primary/20 bg-secondary/10 flex gap-2">
        <span className="text-primary font-mono py-2.5">{'>'}</span>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter system command..."
          className="bg-transparent border-none text-primary font-mono focus-visible:ring-0 placeholder:text-primary/30 h-auto py-2.5 rounded-none"
        />
        <Button 
          type="submit" 
          disabled={!input.trim() || isSending}
          variant="ghost"
          className="text-primary hover:text-white hover:bg-primary/20 rounded-none"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
}
