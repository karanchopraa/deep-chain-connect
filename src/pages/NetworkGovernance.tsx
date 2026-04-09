import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { Network, Users, FileText, Plus, UserPlus, Eye, EyeOff, Download } from "lucide-react";
import { toast } from "sonner";

const kpis = [
  { label: "Active Nodes", value: "24", icon: Network, color: "text-captain" },
  { label: "Pending Invites", value: "7", icon: UserPlus, color: "text-amber" },
  { label: "Smart Contracts", value: "156", icon: FileText, color: "text-emerald" },
];

const vendors = [
  { name: "Oceanic Foods Ltd", role: "Supplier", status: "Active Node", date: "2024-01-05" },
  { name: "BlueWave Logistics", role: "Logistics", status: "Active Node", date: "2024-01-12" },
  { name: "FreshCatch Processing", role: "Processor", status: "KYB Under Review", date: "2024-02-01" },
  { name: "Neptune Fisheries", role: "Supplier", status: "Invited", date: "2024-02-10" },
  { name: "Arctic Cold Chain", role: "Logistics", status: "Active Node", date: "2023-11-20" },
  { name: "SeaPrime Exports", role: "Supplier", status: "KYB Under Review", date: "2024-02-15" },
];

const channels = [
  { data: "Catch GPS Coordinates", vendorA: true, vendorB: true, vendorC: false },
  { data: "Pricing & Invoicing", vendorA: true, vendorB: false, vendorC: false },
  { data: "Temperature Logs", vendorA: true, vendorB: true, vendorC: true },
  { data: "QC Certificates", vendorA: true, vendorB: true, vendorC: true },
  { data: "Payment Settlements", vendorA: true, vendorB: false, vendorC: true },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    "Active Node": "bg-emerald/10 text-emerald border-emerald/20",
    "KYB Under Review": "bg-amber/10 text-amber border-amber/20",
    Invited: "bg-captain/10 text-captain border-captain/20",
  };
  return map[status] || "";
};

export default function NetworkGovernance() {
  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Network className="h-5 w-5 text-captain" />
              Network Governance & Partners
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage consortium membership and data channels</p>
          </div>
          <Button size="sm" onClick={() => toast.success("Invitation sent to new partner")}>
            <Plus className="mr-2 h-4 w-4" />
            Invite New Partner
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2.5 rounded-lg bg-muted`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="vendors">
          <TabsList>
            <TabsTrigger value="vendors" className="text-xs">
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Vendor Onboarding
            </TabsTrigger>
            <TabsTrigger value="channels" className="text-xs">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Channel Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vendors">
            <Card className="glass-card">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Partner Registry</CardTitle>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.info("Exporting CSV...")}>
                  <Download className="mr-1.5 h-3 w-3" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Organization</TableHead>
                      <TableHead className="text-xs">Role</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Onboarded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((v) => (
                      <TableRow key={v.name}>
                        <TableCell className="text-sm font-medium">{v.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{v.role}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${statusBadge(v.status)}`}>
                            {v.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{v.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Data Channel Matrix (Hyperledger Fabric Channels)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Data Type</TableHead>
                      <TableHead className="text-xs text-center">Oceanic Foods</TableHead>
                      <TableHead className="text-xs text-center">BlueWave Logistics</TableHead>
                      <TableHead className="text-xs text-center">FreshCatch Processing</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {channels.map((ch) => (
                      <TableRow key={ch.data}>
                        <TableCell className="text-sm font-medium">{ch.data}</TableCell>
                        {[ch.vendorA, ch.vendorB, ch.vendorC].map((visible, i) => (
                          <TableCell key={i} className="text-center">
                            {visible ? (
                              <Eye className="h-4 w-4 text-emerald mx-auto" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AppLayout>
  );
}
