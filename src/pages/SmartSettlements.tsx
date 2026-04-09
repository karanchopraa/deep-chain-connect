import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Landmark, Download, Hash, FileText, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";

interface Contract {
  id: string;
  buyer: string;
  seller: string;
  condition: string;
  value: string;
  status: "Awaiting Delivery" | "Conditions Met" | "Dispute";
  txHash: string;
  deliveryDate: string;
  docs: string[];
}

const contracts: Contract[] = [
  { id: "SC-2024-0891", buyer: "Metro Wholesale", seller: "Oceanic Foods Ltd", condition: "Temp remained < -18°C", value: "$124,500", status: "Conditions Met", txHash: "0x7f3a9b2c1d4e5f6a", deliveryDate: "2024-01-28", docs: ["Bill of Lading #BL-2201", "Temp Log Report", "QC Certificate"] },
  { id: "SC-2024-0903", buyer: "FreshMart Corp", seller: "Neptune Fisheries", condition: "Delivered within 48hrs", value: "$67,200", status: "Awaiting Delivery", txHash: "0x2e8d1c4b6a9f3e7d", deliveryDate: "2024-02-15", docs: ["Purchase Order #PO-1105"] },
  { id: "SC-2024-0915", buyer: "SeaKing Restaurants", seller: "FreshCatch Processing", condition: "Temp remained < -18°C", value: "$43,800", status: "Dispute", txHash: "0x5c1e9a7b3d2f6e4c", deliveryDate: "2024-02-10", docs: ["Bill of Lading #BL-2245", "Temp Violation Report"] },
  { id: "SC-2024-0927", buyer: "Global Seafood Inc", seller: "Arctic Cold Chain", condition: "MSC certification valid", value: "$215,000", status: "Conditions Met", txHash: "0x8a4f2d6c1b9e3a7f", deliveryDate: "2024-01-20", docs: ["Bill of Lading #BL-2198", "MSC Certificate", "Payment Receipt"] },
  { id: "SC-2024-0934", buyer: "Coastal Dining Group", seller: "SeaPrime Exports", condition: "Weight variance < 2%", value: "$31,400", status: "Awaiting Delivery", txHash: "0x3b7e1d9c5a2f8e6b", deliveryDate: "2024-02-20", docs: ["Purchase Order #PO-1122"] },
];

const statusConfig: Record<string, { className: string; icon: any }> = {
  "Conditions Met": { className: "bg-emerald/10 text-emerald border-emerald/20", icon: CheckCircle2 },
  "Awaiting Delivery": { className: "bg-amber/10 text-amber border-amber/20", icon: Clock },
  Dispute: { className: "bg-rose/10 text-rose border-rose/20", icon: AlertTriangle },
};

export default function SmartSettlements() {
  const [selected, setSelected] = useState<Contract | null>(null);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Landmark className="h-5 w-5 text-captain" />
              Smart Contract Settlements
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Automated B2B payments triggered by verified delivery conditions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast.info("Exporting...")}>
              <Download className="mr-1.5 h-3 w-3" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Escrow Released", value: "$339,500", sub: "2 contracts", color: "text-emerald" },
            { label: "Awaiting Delivery", value: "$98,600", sub: "2 contracts", color: "text-amber" },
            { label: "In Dispute", value: "$43,800", sub: "1 contract", color: "text-rose" },
          ].map((kpi) => (
            <Card key={kpi.label} className="glass-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Contract ID</TableHead>
                  <TableHead className="text-xs">Buyer</TableHead>
                  <TableHead className="text-xs">Seller</TableHead>
                  <TableHead className="text-xs">Delivery Condition</TableHead>
                  <TableHead className="text-xs">Value</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((c) => {
                  const config = statusConfig[c.status];
                  const StatusIcon = config.icon;
                  return (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelected(c)}
                    >
                      <TableCell className="hash-display text-[11px]">{c.id}</TableCell>
                      <TableCell className="text-sm">{c.buyer}</TableCell>
                      <TableCell className="text-sm">{c.seller}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.condition}</TableCell>
                      <TableCell className="text-sm font-semibold">{c.value}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${config.className}`}>
                          <StatusIcon className="mr-1 h-2.5 w-2.5" />
                          {c.status === "Conditions Met" ? "Escrow Released" : c.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-[420px] sm:w-[480px]">
          {selected && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle className="text-lg">Settlement Receipt</SheetTitle>
                <p className="text-xs text-muted-foreground">{selected.id}</p>
              </SheetHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Buyer</p>
                    <p className="font-medium">{selected.buyer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Seller</p>
                    <p className="font-medium">{selected.seller}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Value</p>
                    <p className="font-bold text-lg">{selected.value}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery Date</p>
                    <p className="font-medium">{selected.deliveryDate}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Cryptographic Receipt</p>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-captain" />
                      <span className="text-[10px] text-muted-foreground">Transaction Hash</span>
                    </div>
                    <p className="hash-display text-[11px] break-all">{selected.txHash}8b2d1e4f9a6c3b7e5d0f2a8c1b9e7d3f</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Linked Documents</p>
                  <div className="space-y-2">
                    {selected.docs.map((doc) => (
                      <div key={doc} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
                        <FileText className="h-4 w-4 text-captain" />
                        <span className="text-xs font-medium">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`flex items-center gap-2 p-3 rounded-lg ${statusConfig[selected.status].className.replace(/text-\S+/, '').trim()}`}>
                  {(() => { const Icon = statusConfig[selected.status].icon; return <Icon className="h-4 w-4" />; })()}
                  <span className="text-xs font-medium">
                    {selected.status === "Conditions Met"
                      ? "Payment automatically released from escrow"
                      : selected.status === "Dispute"
                      ? "Temperature violation detected — payment held"
                      : "Awaiting delivery confirmation"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
