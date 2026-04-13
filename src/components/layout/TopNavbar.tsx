import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRole, ROLE_LABELS, UserRole } from "@/contexts/RoleContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lock, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNavbar() {
  const { role, setRole, logout } = useRole();

  return (
    <header className="h-14 flex items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-emerald" />
          <span className="text-xs text-muted-foreground font-medium">Permissioned Network</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">View as:</span>
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger className="w-[200px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                <SelectItem key={r} value={r} className="text-xs">
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Badge variant="outline" className="text-[10px] h-6 bg-emerald/10 text-emerald border-emerald/20">
          Mainnet
        </Badge>

        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-captain rounded-full" />
        </Button>

        <div className="h-5 w-px bg-border mx-1" />

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout} title="Sign Out">
          <LogOut className="h-4 w-4 text-rose" />
        </Button>
      </div>
    </header>
  );
}
