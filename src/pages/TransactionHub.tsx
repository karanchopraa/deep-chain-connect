import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Database } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function TransactionHub() {
  const { data, isLoading } = useQuery({
    queryKey: ["networkEvents"],
    queryFn: async () => {
      const res = await fetch(`http://${window.location.hostname}:3001/api/events?limit=50`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to fetch");
      return json.data;
    },
    refetchInterval: 5000,
  });

  const events = (data || []).slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Database className="h-5 w-5 text-captain" />
            Transaction Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Raw immutable supply chain event stream</p>
        </div>

        <Card className="glass-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Tx Hash</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Node (Org)</TableHead>
                  <TableHead className="text-xs">Timestamp</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Loading ledger data...</TableCell></TableRow>
                ) : events.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No events recorded.</TableCell></TableRow>
                ) : events.map((ev: any) => (
                  <TableRow key={ev.id}>
                    <TableCell className="text-[10px] text-emerald font-mono">{ev.txHash}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] uppercase">{ev.type}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{ev.organization.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(ev.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald/10 text-emerald text-[9px] border-emerald/20 hover:bg-emerald/20">
                        {ev.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
