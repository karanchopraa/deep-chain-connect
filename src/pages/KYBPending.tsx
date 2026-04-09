import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Clock, Shield, FileText, Anchor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export default function KYBPending() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useRole();
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = () => {
    setUploaded(true);
    toast.success("Business License uploaded. Pending network validation.");
  };

  const handleBypass = () => {
    setIsAuthenticated(true);
    navigate("/events");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-ocean mx-auto flex items-center justify-center mb-4">
            <Anchor className="w-7 h-7 text-ocean-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Network Approval Required</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your consortium membership is pending KYB verification
          </p>
        </div>

        <Card className="glass-card">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber/10 border border-amber/20">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber" />
                <div>
                  <p className="text-sm font-medium text-foreground">KYB Status</p>
                  <p className="text-xs text-muted-foreground">Submitted 2 min ago</p>
                </div>
              </div>
              <Badge className="bg-amber/15 text-amber border-amber/20 text-[10px]">
                Pending Review
              </Badge>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Required Documents
              </h3>

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  uploaded ? "border-emerald/40 bg-emerald/5" : "border-border hover:border-captain/40"
                }`}
              >
                {uploaded ? (
                  <div className="space-y-2">
                    <FileText className="h-8 w-8 text-emerald mx-auto" />
                    <p className="text-sm font-medium text-foreground">business_license.pdf</p>
                    <p className="text-xs text-emerald">Uploaded successfully</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-foreground font-medium">Upload Business License</p>
                    <p className="text-xs text-muted-foreground">PDF, JPG or PNG up to 10MB</p>
                    <Button variant="outline" size="sm" onClick={handleUpload} className="mt-2">
                      Select File
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Shield className="h-4 w-4 text-captain shrink-0" />
              <span>
                All documents are encrypted and stored on the permissioned network.
                Only consortium administrators can review submissions.
              </span>
            </div>

            <Button onClick={handleBypass} className="w-full" variant="outline">
              Skip for Demo → Enter Platform
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
