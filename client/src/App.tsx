import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Loader2, ShieldCheck, User, Lock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { loginMutation } = useAuth();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password }, {
      onError: (error: any) => {
        toast({
          title: "Access Denied",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full border border-primary/30 p-8 bg-card/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)]"></div>
        
        <div className="text-center space-y-6 relative z-10">
          <div className="inline-block p-4 border border-primary/20 bg-primary/5 mb-2">
            <ShieldCheck className="w-12 h-12 text-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-tech text-primary tracking-tighter uppercase italic">
              ANARCHY_OS
            </h1>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Security Access Protocol Required
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-primary uppercase tracking-widest ml-1">Identity</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                <Input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="USERNAME"
                  className="bg-black/50 border-primary/20 rounded-none pl-10 h-11 text-primary placeholder:text-primary/20 focus-visible:ring-primary/30 focus-visible:border-primary/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-primary uppercase tracking-widest ml-1">Access Code</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PASSWORD"
                  className="bg-black/50 border-primary/20 rounded-none pl-10 h-11 text-primary placeholder:text-primary/20 focus-visible:ring-primary/30 focus-visible:border-primary/50"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-primary text-black hover:bg-primary/90 rounded-none h-12 font-tech uppercase italic tracking-wider group relative overflow-hidden mt-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                {loginMutation.isPending ? "Validating..." : "Initialize Session"}
              </span>
              <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            </Button>
          </form>
          
          <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground pt-4">
            <span>SECURE_LINK: ESTABLISHED</span>
            <span>V2.0.4-LOCKED</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
