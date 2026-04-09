import { useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Anchor, Shield, Lock, ArrowRight } from "lucide-react";
import oceanHero from "@/assets/ocean-hero.jpg";
import { motion } from "framer-motion";

const participantRoles = [
  "Captain Fresh Node",
  "Independent Supplier",
  "Processing Hub",
  "Logistics Partner",
  "Financier / Bank",
  "Institutional Buyer",
];

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [participantRole, setParticipantRole] = useState("");
  const { setIsAuthenticated } = useRole();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup) {
      navigate("/kyb-pending");
    } else {
      setIsAuthenticated(true);
      navigate("/events");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={oceanHero} alt="Ocean" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 ocean-gradient opacity-80" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-ocean-foreground">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-captain flex items-center justify-center">
              <Anchor className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">WOW Platform</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-60">Blockchain Consortium</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold leading-tight max-w-md">
              Verifiable Seafood
              <br />
              <span className="text-captain-light">Supply Chain Trust</span>
            </h2>
            <p className="text-sm opacity-70 max-w-sm leading-relaxed">
              Multi-party traceability on Hyperledger Fabric. From ocean to plate,
              every handoff is cryptographically sealed and immutable.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Shield, label: "Permissioned Ledger" },
                { icon: Lock, label: "End-to-End Encryption" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs opacity-60">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <p className="text-[10px] opacity-30">
            Powered by Captain Fresh • Hyperledger Fabric v2.5
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-card">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md space-y-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {isSignup ? "Join the Consortium" : "Welcome back"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignup
                ? "Request access to the permissioned network"
                : "Sign in to your consortium node"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Organization Name</Label>
                <Input placeholder="Acme Seafood Co." className="h-10" />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-medium">Email</Label>
              <Input type="email" placeholder="operator@example.com" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Password</Label>
              <Input type="password" placeholder="••••••••" className="h-10" />
            </div>

            {isSignup && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Select Participant Role</Label>
                <Select value={participantRole} onValueChange={setParticipantRole}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Choose your role in the network..." />
                  </SelectTrigger>
                  <SelectContent>
                    {participantRoles.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full h-10 bg-primary hover:bg-primary/90">
              {isSignup ? "Request Network Access" : "Sign In"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-captain hover:underline"
            >
              {isSignup ? "Already a member? Sign in" : "New participant? Request access"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
