import { API_URL } from "@/config";
import { useState } from "react";
import { useRole, ROLE_LABELS } from "@/contexts/RoleContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  FileInput,
  Wifi,
  Upload,
  MapPin,
  Ship,
  Thermometer,
  Truck,
  CheckCircle2,
  Hash,
} from "lucide-react";

function SupplierForm() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium">Vessel Name</Label>
        <Input name="vesselName" placeholder="MV Ocean Harvest" required className="h-9" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Species</Label>
        <Input name="species" placeholder="Yellowfin Tuna (Thunnus albacares)" required className="h-9" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">GPS Coordinates</Label>
        <div className="flex gap-2">
          <Input name="gpsLat" type="number" step="any" placeholder="Lat: 12.9716" required className="h-9" />
          <Input name="gpsLon" type="number" step="any" placeholder="Lon: 77.5946" required className="h-9" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Weight (kg)</Label>
        <Input name="weightKg" type="number" step="any" placeholder="2500" required className="h-9" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Catch Date</Label>
        <Input name="catchDate" type="date" required className="h-9" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Fishing Method</Label>
        <Input name="fishingMethod" placeholder="Pole & Line" required className="h-9" />
      </div>
    </div>
  );
}

function ProcessorForm() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium">Input Batch IDs</Label>
        <Textarea name="inputBatchIds" placeholder="BATCH-2024-001, BATCH-2024-002" required className="h-20 text-xs" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Output Lot Number</Label>
        <Input name="outputLotNumber" placeholder="LOT-PRO-20240115-A" required className="h-9" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Processing Yield %</Label>
        <Input name="processingYieldPct" type="number" step="any" placeholder="72" required className="h-9" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">QC Certificate</Label>
        <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-captain/40 transition-colors">
          <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Upload QC Certificate</p>
        </div>
      </div>
    </div>
  );
}

function LogisticsForm() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2 md:col-span-2">
        <Label className="text-xs font-medium">SKU to Transfer</Label>
        <Input name="sku" placeholder="CATCH-2024-..." required className="h-9" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Carrier ID</Label>
        <Input name="carrierId" placeholder="MAERSK-IND-4521" required className="h-9" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Vehicle / Container Plate</Label>
        <Input name="vehiclePlate" placeholder="MSKU-1234567" required className="h-9" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Handover From</Label>
        <Input name="handoverFrom" placeholder="Chennai Processing Hub" required className="h-9" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Handover To</Label>
        <Input name="handoverTo" placeholder="Mumbai Cold Storage" required className="h-9" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label className="text-xs font-medium">Temperature Logs</Label>
        <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-captain/40 transition-colors">
          <Thermometer className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Upload IoT Temperature Log (.csv)</p>
        </div>
      </div>
    </div>
  );
}

export default function EventLogging() {
  const { role } = useRole();
  const [erpSync, setErpSync] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const roleIcon = { supplier: Ship, processor: CheckCircle2, logistics: Truck, admin: FileInput }[role] || FileInput;
  const RoleIcon = roleIcon;

  const formTitle = {
    supplier: "Record Catch / Harvest",
    processor: "Record Processing Activity",
    logistics: "Chain of Custody Handover",
    admin: "Record Catch / Harvest",
  }[role] || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const apiPayload: any = {};
    let type = "CATCH";

    if (role === "supplier" || role === "admin") {
      type = "CATCH";
      apiPayload.type = type;
      apiPayload.data = {
        vesselName: formData.get("vesselName"),
        species: formData.get("species"),
        gpsLat: parseFloat(formData.get("gpsLat") as string),
        gpsLon: parseFloat(formData.get("gpsLon") as string),
        weightKg: parseFloat(formData.get("weightKg") as string),
        catchDate: new Date(formData.get("catchDate") as string).toISOString(),
        fishingMethod: formData.get("fishingMethod"),
      };
    } else if (role === "processor") {
      type = "PROCESSING";
      apiPayload.type = type;
      apiPayload.data = {
        inputBatchIds: (formData.get("inputBatchIds") as string).split(",").map(s => s.trim()),
        outputLotNumber: formData.get("outputLotNumber"),
        processingYieldPct: parseFloat(formData.get("processingYieldPct") as string),
        qcCertificateHash: "mock-ipfs-hash",
      };
    } else if (role === "logistics") {
      type = "CUSTODY_TRANSFER";
      apiPayload.type = type;
      apiPayload.data = {
        sku: formData.get("sku"),
        carrierId: formData.get("carrierId"),
        vehiclePlate: formData.get("vehiclePlate"),
        handoverFrom: formData.get("handoverFrom"),
        handoverTo: formData.get("handoverTo"),
      };
    }

    try {
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(apiPayload),
      });

      const resJson = await response.json();
      if (!response.ok) throw new Error(resJson.error?.message || "Failed to commit");

      toast.success("Successfully hashed and recorded to Hyperledger Fabric", {
        description: `Tx: ${resJson.data.txHash}`,
        duration: 5000,
      });
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error("Failed to commit event", {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileInput className="h-5 w-5 text-captain" />
              Log Supply Chain Event
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acting as: <span className="font-medium text-foreground">{ROLE_LABELS[role]}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Wifi className={`h-4 w-4 ${erpSync ? "text-emerald" : "text-muted-foreground"}`} />
              <Label className="text-xs text-muted-foreground">Sync via ERP</Label>
              <Switch checked={erpSync} onCheckedChange={setErpSync} />
            </div>
          </div>
        </div>

        {erpSync ? (
          <Card className="glass-card">
            <CardContent className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald/10 mx-auto flex items-center justify-center animate-pulse-glow">
                <Wifi className="h-6 w-6 text-emerald" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">ERP Auto-Sync Active</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Data is being streamed from your integrated ERP system (SAP / Oracle) to the distributed ledger in real-time.
              </p>
              <Badge className="bg-emerald/10 text-emerald border-emerald/20 text-[10px]">
                Last sync: 3 seconds ago
              </Badge>
            </CardContent>
          </Card>
        ) : !formTitle ? (
          <Card className="glass-card">
            <CardContent className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted/30 mx-auto flex items-center justify-center">
                <FileInput className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Read-Only Access</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Your role does not have permission to log supply chain events. Use the Inventory, Transaction Hub, or Traceability pages to view network activity.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <RoleIcon className="h-4 w-4 text-captain" />
                {formTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {(role === "supplier" || role === "admin") && <SupplierForm />}
                {role === "processor" && <ProcessorForm />}
                {role === "logistics" && <LogisticsForm />}

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <Hash className="h-3.5 w-3.5 text-captain shrink-0" />
                  <span>This event will be SHA-256 hashed and committed to the consortium ledger.</span>
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing & committing...
                    </span>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Sign & Commit to Distributed Ledger
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </AppLayout>
  );
}
