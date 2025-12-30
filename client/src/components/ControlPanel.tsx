import { useStartBot, useStopBot, useBotStatus } from "@/hooks/use-bot";
import { Button } from "@/components/ui/button";
import { Power, Radio } from "lucide-react";

export function ControlPanel() {
  const { data: status } = useBotStatus();
  const { mutate: startBot, isPending: isStarting } = useStartBot();
  const { mutate: stopBot, isPending: isStopping } = useStopBot();

  const isOnline = status?.online;

  return (
    <div className="flex gap-4">
      <Button
        onClick={() => startBot()}
        disabled={isOnline || isStarting || isStopping}
        className={`flex-1 h-16 text-lg font-tech font-bold rounded-none border-2 transition-all duration-300
          ${isOnline 
            ? 'border-gray-800 text-gray-800 bg-transparent cursor-not-allowed opacity-30' 
            : 'border-primary text-primary hover:bg-primary hover:text-black shadow-[0_0_20px_rgba(0,255,0,0.2)]'
          }`}
      >
        <Power className="w-6 h-6 mr-3" />
        {isStarting ? "INITIALIZING..." : "INITIATE_SEQUENCE"}
      </Button>

      <Button
        onClick={() => stopBot()}
        disabled={!isOnline || isStarting || isStopping}
        className={`flex-1 h-16 text-lg font-tech font-bold rounded-none border-2 transition-all duration-300
          ${!isOnline 
            ? 'border-gray-800 text-gray-800 bg-transparent cursor-not-allowed opacity-30' 
            : 'border-destructive text-destructive hover:bg-destructive hover:text-white shadow-[0_0_20px_rgba(255,0,0,0.2)]'
          }`}
      >
        <Radio className="w-6 h-6 mr-3" />
        {isStopping ? "TERMINATING..." : "ABORT_CONNECTION"}
      </Button>
    </div>
  );
}
