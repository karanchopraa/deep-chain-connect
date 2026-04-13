import { prisma } from "../../config/database.js";

export async function getDashboardStats() {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Total network volume
    const totalVolumeResult = await tx.inventoryItem.aggregate({
      _sum: { volumeKg: true },
    });
    const totalVolume = totalVolumeResult._sum.volumeKg || 0;

    // 2. Volume by status
    const byStatus = await tx.inventoryItem.groupBy({
      by: ["status"],
      _sum: { volumeKg: true },
    });

    // 3. Network participants count
    const participantsCount = await tx.organization.count();

    // 4. Ledger Event Count
    const eventsCount = await tx.supplyChainEvent.count();

    // 5. Regional estimates (grouping by 'location' string)
    const byLocationRaw = await tx.inventoryItem.groupBy({
      by: ["location"],
      _sum: { volumeKg: true },
      orderBy: { _sum: { volumeKg: "desc" } },
      take: 5,
    });

    // 6. Volume by species / category
    const bySpeciesRaw = await tx.inventoryItem.groupBy({
      by: ["species"],
      _sum: { volumeKg: true },
      orderBy: { _sum: { volumeKg: "desc" } },
    });

    // 7. Ownership Channels (In-House vs Consortium)
    // Fetch directly from joined items to categorize by Owner Role
    const allItems = await tx.inventoryItem.findMany({
      select: {
        volumeKg: true,
        owner: { select: { role: true } }
      }
    });

    let inhouseVolume = 0;
    let consortiumVolume = 0;

    for (const item of allItems) {
      if (item.owner.role === "ADMIN") {
        inhouseVolume += item.volumeKg;
      } else {
        consortiumVolume += item.volumeKg;
      }
    }

    // 8. Recharts Volume Trend over Time
    const allEvents = await tx.supplyChainEvent.findMany({
      select: { type: true, createdAt: true },
      orderBy: { createdAt: "asc" }
    });

    const trendMap: Record<string, { month: string; caught: number; processed: number; shipped: number }> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    allEvents.forEach((ev) => {
      const date = new Date(ev.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!trendMap[key]) {
        trendMap[key] = { month: `${months[date.getMonth()]}`, caught: 0, processed: 0, shipped: 0 };
      }
      if (ev.type === "CATCH") trendMap[key].caught += 1;
      if (ev.type === "PROCESSING") trendMap[key].processed += 1;
      if (ev.type === "CUSTODY_TRANSFER") trendMap[key].shipped += 1;
    });
    const volumeTrend = Object.values(trendMap);

    // 9. Node Activity Rankings
    const orgActivityRaw = await tx.supplyChainEvent.groupBy({
      by: ["orgId"],
      _count: { id: true },
    });
    
    // Join names manually to avoid heavy deep joining logic on groupBys
    const orgMapRaw = await tx.organization.findMany({ select: { id: true, name: true, role: true }});
    const orgMap = Object.fromEntries(orgMapRaw.map(o => [o.id, { name: o.name, role: o.role }]));

    const organizationActivity = orgActivityRaw.map(oa => ({
      name: orgMap[oa.orgId]?.name || "Unknown",
      role: orgMap[oa.orgId]?.role || "Unknown",
      events: oa._count.id
    })).sort((a, b) => b.events - a.events).slice(0, 5); // top 5

    // 10. Advanced Simulated Telemetry & Analytics
    // We simulate highly realistic IoT and financial telemetry dynamically scaled against actual network volume
    const advancedAnalytics = {
      quality: {
        tempExcursionRate: 1.4, // % of shipments breached threshold
        spoilageRateKg: Math.floor(totalVolume * 0.012), // 1.2% total spoilage loss
        avgShelfLifeDays: 14.2,
        qcPassRate: 97.8 // % 
      },
      logistics: {
        otifRate: 94.5, // On-Time In-Full %
        avgTransitTimeHours: 42,
        routeEfficiencyScore: 88, // 0-100
      },
      inventory: {
        inventoryTurnoverRatio: 4.8, 
        daysSalesOfInventory: 18, // DSI
        capacityUtilizationPct: 76.5,
      },
      financial: {
        costPerKgDistributed: 1.24, // $
        disputeRate: 0.8, // %
        avgSettlementHours: 3.5, // smart contract speed
      },
      compliance: {
        traceabilityScore: 99.8, // % traceable
        carbonFootprintTotalMt: parseFloat(((totalVolume * 1.8) / 1000).toFixed(2)), // 1.8kg CO2 per kg seafood -> Metric Tons
      }
    };

    return {
      totalVolumeKg: totalVolume,
      statusDistribution: byStatus.map((s) => ({
        status: s.status,
        volumeKg: s._sum.volumeKg || 0,
      })),
      speciesDistribution: bySpeciesRaw.map((s) => ({
        species: s.species,
        volumeKg: s._sum.volumeKg || 0,
      })),
      ownershipSplit: {
        inhouse: inhouseVolume,
        consortium: consortiumVolume,
      },
      topLocations: byLocationRaw.map((l) => ({
        location: l.location,
        volumeKg: l._sum.volumeKg || 0,
      })),
      networkStats: {
        totalOrganizations: participantsCount,
        totalEventsCommitted: eventsCount,
      },
      chartData: {
        volumeTrend,
        organizationActivity
      },
      advancedAnalytics
    };
  });

  return result;
}
