import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Package, Search, Download, Shield, Filter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    IN_STORAGE: "bg-emerald/10 text-emerald border-emerald/20",
    IN_TRANSIT: "bg-sky/10 text-sky border-sky/20",
    PROCESSED: "bg-purple/10 text-purple border-purple/20",
    PROCESSING: "bg-amber/10 text-amber border-amber/20",
  };
  return map[status] || "bg-muted text-muted-foreground";
};

export default function ConsortiumInventory() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await fetch(`http://${window.location.hostname}:3001/api/inventory`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to fetch");
      return json.data as any[];
    },
    refetchInterval: 5000,
  });

  const inventory = data || [];

  const filtered = inventory.filter((item) => {
    if (filter === "certified" && !item.certifications) return false;
    if (search && !item.species.toLowerCase().includes(search.toLowerCase()) && !item.sku.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-captain" />
              Global Consortium Inventory
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Blockchain-verified stock across all network nodes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast.info("Exporting CSV...")}>
              <Download className="mr-1.5 h-3 w-3" />
              CSV
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast.info("Generating PDF...")}>
              <Download className="mr-1.5 h-3 w-3" />
              PDF
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by SKU or species..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[220px] h-9 text-xs">
              <Filter className="mr-1.5 h-3 w-3" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Inventory</SelectItem>
              <SelectItem value="certified">Sustainably Certified Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="glass-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">SKU</TableHead>
                  <TableHead className="text-xs">Species</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Verifiable Owner</TableHead>
                  <TableHead className="text-xs">Volume</TableHead>
                  <TableHead className="text-xs">Expiry</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Certification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading consortium inventory...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No inventory items found.</TableCell>
                  </TableRow>
                ) : filtered.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell className="hash-display text-[11px]">{item.sku}</TableCell>
                    <TableCell className="text-sm font-medium">{item.species}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.location}</TableCell>
                    <TableCell className="text-xs">{item.owner?.name}</TableCell>
                    <TableCell className="text-xs font-medium">{item.volumeKg} kg</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${statusBadge(item.status)}`}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.certifications || "None"}</TableCell>
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
