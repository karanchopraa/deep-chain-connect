import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Ship, CheckCircle2, Truck, FileInput, Fingerprint } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Traceability() {
  const [sku, setSku] = useState("");
  const [fetchSku, setFetchSku] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["traceability", fetchSku],
    queryFn: async () => {
      if (!fetchSku) return null;
      const res = await fetch(`http://${window.location.hostname}:3001/api/inventory/${fetchSku}/traceability`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Not found");
      return json.data;
    },
    enabled: !!fetchSku,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim()) return;
    setFetchSku(sku);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "CATCH": return <Ship className="w-5 h-5" />;
      case "PROCESSING": return <CheckCircle2 className="w-5 h-5" />;
      case "CUSTODY_TRANSFER": return <Truck className="w-5 h-5" />;
      default: return <FileInput className="w-5 h-5" />;
    }
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-captain" />
            Seafood Traceability Explorer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Trace the complete origin timeline of any seafood SKU.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter SKU (e.g. CATCH-2024-0012)"
              className="pl-9 h-10"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>
          <Button type="submit" className="h-10">Trace Asset</Button>
        </form>

        {isLoading && <p className="text-sm text-muted-foreground text-center py-6">Querying Consortium Ledger...</p>}
        {error && <p className="text-sm text-rose text-center py-6">{(error as any).message}</p>}

        {data && (
          <div className="space-y-6">
            <Card className="glass-card">
              <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Asset SKU</p>
                  <p className="text-sm font-semibold">{data.currentInfo.sku}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Species</p>
                  <p className="text-sm font-medium">{data.currentInfo.species}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Current Owner</p>
                  <p className="text-sm">{data.currentInfo.owner}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Status</p>
                  <Badge variant="outline" className="text-[10px]">{data.currentInfo.status}</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="relative border-l ml-6 border-border pl-8 space-y-8 py-4">
              {data.lifecycle.map((event: any, index: number) => (
                <div key={event.eventId} className="relative">
                  <div className="absolute -left-[45px] top-0.5 w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center text-captain z-10">
                    {getIcon(event.type)}
                  </div>
                  
                  <Card className="glass-card relative overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-sm flex items-center gap-2">
                            {event.type.replace("_", " ")}
                            <Badge variant="secondary" className="text-[9px] bg-emerald/10 text-emerald">Verified</Badge>
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 text-emerald font-mono">
                            Tx: {event.txHash}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium">{new Date(event.date).toLocaleDateString()}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(event.date).toLocaleTimeString()}</p>
                        </div>
                      </div>

                      <div className="bg-muted/30 rounded p-3 text-xs grid grid-cols-2 gap-y-2 gap-x-4">
                        <div className="col-span-2 text-[10px] uppercase text-muted-foreground tracking-wider mb-1">
                          Node: {event.orgName} ({event.orgRole})
                        </div>
                        {Object.entries(event.data).map(([key, val]) => (
                          <div key={key}>
                            <span className="opacity-60">{key}:</span> <span className="font-medium">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
