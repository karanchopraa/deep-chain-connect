import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Users, Box, TrendingUp, ThermometerSnowflake, AlertTriangle, ShieldCheck, Clock, Package, Truck, Compass, Banknote, Leaf, Scale } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = [
  '#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#f43f5e', 
  '#14b8a6', '#6366f1', '#ec4899', '#f97316', '#22c55e', 
  '#06b6d4', '#a855f7'
];

export default function AdminDashboard() {
  const { role } = useRole();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await fetch(`http://${window.location.hostname}:3001/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to load stats");
      return json.data;
    },
    enabled: role === "admin",
  });

  if (role !== "admin") {
    return <Navigate to="/events" replace />;
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-captain" />
            Captain Fresh Global Operations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Network overview and administrative metrics</p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        ) : data ? (
          <>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="bg-background/20 backdrop-blur-lg border border-white/10 h-11">
                <TabsTrigger value="overview" className="data-[state=active]:bg-captain data-[state=active]:text-white">Overview</TabsTrigger>
                <TabsTrigger value="quality" className="data-[state=active]:bg-captain data-[state=active]:text-white">Quality & Cold Chain</TabsTrigger>
                <TabsTrigger value="logistics" className="data-[state=active]:bg-captain data-[state=active]:text-white">Logistics & Inventory</TabsTrigger>
                <TabsTrigger value="financial" className="data-[state=active]:bg-captain data-[state=active]:text-white">Financial & ESG</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                        <Box className="h-4 w-4" /> Total Volume
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{data.totalVolumeKg.toLocaleString()} kg</p>
                    </CardContent>
                  </Card>
    
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                        <Users className="h-4 w-4" /> Consortium Nodes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{data.networkStats.totalOrganizations}</p>
                    </CardContent>
                  </Card>
    
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Ledger Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{data.networkStats.totalEventsCommitted}</p>
                    </CardContent>
                  </Card>
                </div>
    
                {/* Full Width Area Chart */}
                <Card className="glass-card mb-4 mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Consortium Transaction Throughput</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.chartData?.volumeTrend || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCaught" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="caught" stroke="#10b981" fillOpacity={1} fill="url(#colorCaught)" name="Caught" />
                        <Area type="monotone" dataKey="processed" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorProcessed)" name="Processed" />
                        <Area type="monotone" dataKey="shipped" stroke="#8b5cf6" fillOpacity={0.1} fill="#8b5cf6" name="Transfered" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
    
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="glass-card min-h-[300px]">
                    <CardHeader>
                      <CardTitle className="text-sm">Seafood Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] pb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.speciesDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="volumeKg"
                            nameKey="species"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={true}
                            style={{ fontSize: '10px' }}
                          >
                            {data.speciesDistribution.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
    
                  <Card className="glass-card min-h-[300px]">
                    <CardHeader>
                      <CardTitle className="text-sm">Node Activity Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.chartData?.organizationActivity || []} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
                          <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={80} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="events" fill="#10b981" radius={[0, 4, 4, 0]} name="Ledger Events" barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
    
                  <Card className="glass-card min-h-[300px]">
                    <CardHeader>
                      <CardTitle className="text-sm">Ownership Channels</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6 mt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald" /> In-House (Captain Fresh)</span>
                            <span className="font-semibold">{data.ownershipSplit.inhouse.toLocaleString()} kg</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald" 
                              style={{ width: `${(data.ownershipSplit.inhouse / (data.totalVolumeKg || 1)) * 100}%` }} 
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-captain" /> Consortium Partners</span>
                            <span className="font-semibold">{data.ownershipSplit.consortium.toLocaleString()} kg</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-captain" 
                              style={{ width: `${(data.ownershipSplit.consortium / (data.totalVolumeKg || 1)) * 100}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* NEW TAB: QUALITY & COLD CHAIN */}
              <TabsContent value="quality" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="glass-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider">Temp Excursions</CardTitle>
                      <ThermometerSnowflake className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{data.advancedAnalytics.quality.tempExcursionRate}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Shipments breaching threshold</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider">Spoilage Loss</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{data.advancedAnalytics.quality.spoilageRateKg.toLocaleString()} <span className="text-lg text-muted-foreground font-normal">kg</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Total physical waste generated</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider">QC Pass Rate</CardTitle>
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-emerald-400">{data.advancedAnalytics.quality.qcPassRate}%</p>
                      <p className="text-xs text-muted-foreground mt-1">1st-time quality pass</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider">Avg Shelf Life</CardTitle>
                      <Clock className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{data.advancedAnalytics.quality.avgShelfLifeDays} <span className="text-lg text-muted-foreground font-normal">days</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Predictive freshness rating</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* NEW TAB: LOGISTICS */}
              <TabsContent value="logistics" className="space-y-4 mt-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="glass-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider">On-Time In-Full (OTIF)</CardTitle>
                      <Package className="h-4 w-4 text-captain" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2">
                        <p className="text-4xl font-bold">{data.advancedAnalytics.logistics.otifRate}%</p>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-4">
                        <div className="h-full bg-captain" style={{ width: `${data.advancedAnalytics.logistics.otifRate}%` }} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider">Avg Transit Time</CardTitle>
                      <Truck className="h-4 w-4 text-emerald" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{data.advancedAnalytics.logistics.avgTransitTimeHours} <span className="text-lg text-muted-foreground font-normal">hrs</span></p>
                      <p className="text-sm text-muted-foreground mt-2">Node-to-node duration</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider">Route Efficiency Score</CardTitle>
                      <Compass className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-purple-400">{data.advancedAnalytics.logistics.routeEfficiencyScore}<span className="text-lg text-muted-foreground font-normal">/100</span></p>
                      <p className="text-sm text-muted-foreground mt-2">Based on historical pathfinding</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider">Inventory Turnover</CardTitle>
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{data.advancedAnalytics.inventory.inventoryTurnoverRatio}x</p>
                      <p className="text-sm text-muted-foreground mt-2">Ratio of volume sold vs stored</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider">Capacity Utilization</CardTitle>
                      <Box className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-orange-400">{data.advancedAnalytics.inventory.capacityUtilizationPct}%</p>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-4">
                        <div className="h-full bg-orange-400" style={{ width: `${data.advancedAnalytics.inventory.capacityUtilizationPct}%` }} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider">Days Sales of Inventory</CardTitle>
                      <Clock className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{data.advancedAnalytics.inventory.daysSalesOfInventory} <span className="text-lg text-muted-foreground font-normal">days</span></p>
                      <p className="text-sm text-muted-foreground mt-2">Projected depletion timeline</p>
                    </CardContent>
                  </Card>
                 </div>
              </TabsContent>

              {/* NEW TAB: FINANCIAL & ESG */}
              <TabsContent value="financial" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="glass-card bg-captain/10 border-captain/20">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs uppercase tracking-wider">Cost Distributed</CardTitle>
                      <Banknote className="h-4 w-4 text-captain" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-captain">${data.advancedAnalytics.financial.costPerKgDistributed.toFixed(2)} <span className="text-sm font-normal text-captain/60">/ kg</span></p>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider">Dispute Rate</CardTitle>
                      <Scale className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{data.advancedAnalytics.financial.disputeRate}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Smart Contract Rejections</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider">Settlement Time</CardTitle>
                      <Clock className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{data.advancedAnalytics.financial.avgSettlementHours} <span className="text-lg text-muted-foreground font-normal">hrs</span></p>
                      <p className="text-xs text-muted-foreground mt-1">From receipt to payment trigger</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Card className="glass-card border-emerald/20">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm tracking-wider flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald" /> Traceability Completeness</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-5xl font-bold mt-2 text-emerald">{data.advancedAnalytics.compliance.traceabilityScore}%</p>
                      <p className="text-sm text-foreground/70 mt-2">Volume with 100% unbreakable origin linking on the blockchain.</p>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden mt-6">
                        <div className="h-full bg-emerald" style={{ width: `${data.advancedAnalytics.compliance.traceabilityScore}%` }} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-green-500/20">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm tracking-wider flex items-center gap-2"><Leaf className="h-5 w-5 text-green-500" /> Carbon Footprint Scope</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-5xl font-bold mt-2 text-green-500">{data.advancedAnalytics.compliance.carbonFootprintTotalMt.toLocaleString()} <span className="text-xl text-green-500/70 font-normal">Mt CO2e</span></p>
                      <p className="text-sm text-foreground/70 mt-2">Estimated global transport emissions (Scope 3) across the network.</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </motion.div>
    </AppLayout>
  );
}
