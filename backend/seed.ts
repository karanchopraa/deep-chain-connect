import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import * as eventService from "./src/modules/events/events.service.js";

const prisma = new PrismaClient();

const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

const SPECIES = [
  "Yellowfin Tuna", "Atlantic Salmon", "Black Tiger Shrimp", "Giant Squid", 
  "Pacific Cod", "Mahi Mahi", "Blue Swimmer Crab", "Hokkaido Scallops", 
  "Pacific Halibut", "Swordfish", "Snow Crab", "Lobster"
];
const METHODS = ["Longline", "Aquaculture Pen", "Trawl", "Jigging", "Trapping", "Diving"];

async function main() {
  console.log("Starting massively enriched DB seed...");

  await prisma.supplyChainEvent.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  console.log("Creating Organizations & Users...");
  
  const adminOrg = await prisma.organization.create({ data: { name: "Captain Fresh Admin Node", role: "ADMIN", status: "ACTIVE" } });
  const adminUser = await prisma.user.create({ data: { email: "admin@captainfresh.com", passwordHash, orgId: adminOrg.id, firstName: "Captain", lastName: "Admin" } });

  const supplierOrg = await prisma.organization.create({ data: { name: "Oceanic Harvest Ltd", role: "SUPPLIER", status: "ACTIVE" } });
  const supplierUser = await prisma.user.create({ data: { email: "supplier@oceanic.com", passwordHash, orgId: supplierOrg.id, firstName: "John", lastName: "Harvester" } });

  const supplierOrg2 = await prisma.organization.create({ data: { name: "Nordic Fisheries", role: "SUPPLIER", status: "ACTIVE" } });
  const supplierUser2 = await prisma.user.create({ data: { email: "supplier2@nordic.com", passwordHash, orgId: supplierOrg2.id, firstName: "Erik", lastName: "Nord" } });
  
  const supplierOrg3 = await prisma.organization.create({ data: { name: "Pacific Catch Partners", role: "SUPPLIER", status: "ACTIVE" } });
  const supplierUser3 = await prisma.user.create({ data: { email: "supplier3@pacific.com", passwordHash, orgId: supplierOrg3.id, firstName: "Maya", lastName: "Pacific" } });

  const processorOrg = await prisma.organization.create({ data: { name: "Chennai Prime Processing", role: "PROCESSOR", status: "ACTIVE" } });
  const processorUser = await prisma.user.create({ data: { email: "processor@chennaiprime.com", passwordHash, orgId: processorOrg.id, firstName: "Sarah", lastName: "Processor" } });

  const processorOrg2 = await prisma.organization.create({ data: { name: "Kochi Value Add", role: "PROCESSOR", status: "ACTIVE" } });
  const processorUser2 = await prisma.user.create({ data: { email: "processor2@kochi.com", passwordHash, orgId: processorOrg2.id, firstName: "Ajay", lastName: "Kochi" } });

  const logisticsOrg = await prisma.organization.create({ data: { name: "Maersk Logistics", role: "LOGISTICS", status: "ACTIVE" } });
  const logisticsUser = await prisma.user.create({ data: { email: "driver@maersk.com", passwordHash, orgId: logisticsOrg.id, firstName: "Mike", lastName: "Driver" } });

  const logisticsOrg2 = await prisma.organization.create({ data: { name: "CMA CGM ColdChain", role: "LOGISTICS", status: "ACTIVE" } });
  const logisticsUser2 = await prisma.user.create({ data: { email: "driver2@cma.com", passwordHash, orgId: logisticsOrg2.id, firstName: "Luiz", lastName: "CMA" } });

  const buyerOrg = await prisma.organization.create({ data: { name: "Global Seafood Buyers", role: "BUYER", status: "ACTIVE" } });
  const buyerUser = await prisma.user.create({ data: { email: "buyer@global.com", passwordHash, orgId: buyerOrg.id, firstName: "Alice", lastName: "Buyer" } });

  console.log("Generating 150+ Time-Distributed Supply Chain Events...");

  const startDate = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000); // 120 days ago
  const endDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // 14 days ago (leaves room for processing/shipping without going into the future)
  const now = Date.now();

  // Generate 120 catches across time to ensure full pie-chart and area-chart spread
  for (let i = 0; i < 120; i++) {
    const rnd = Math.random();
    let org, usr, vesselPrefix;
    
    if (rnd < 0.25) {
      org = supplierOrg; usr = supplierUser; vesselPrefix = 'OceanStar';
    } else if (rnd < 0.50) {
      org = supplierOrg2; usr = supplierUser2; vesselPrefix = 'NordicWave';
    } else if (rnd < 0.80) {
      org = supplierOrg3; usr = supplierUser3; vesselPrefix = 'PacificKing';
    } else {
      // 20% is caught directly by Captain Fresh In-House Fleet
      org = adminOrg; usr = adminUser; vesselPrefix = 'CaptainMarine';
    }

    const species = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    const weight = Math.floor(Math.random() * 8000) + 500; // 500kg up to 8500kg
    const date = randomDate(startDate, endDate);

    const ev = await eventService.createEvent(org.id, usr.id, {
      type: "CATCH",
      data: {
        vesselName: `MV ${vesselPrefix} ${i}`,
        species: species,
        gpsLat: +(Math.random() * 40 - 20).toFixed(4),
        gpsLon: +(Math.random() * 40 + 50).toFixed(4),
        weightKg: weight,
        catchDate: date,
        fishingMethod: METHODS[Math.floor(Math.random() * METHODS.length)],
      }
    });

    await prisma.supplyChainEvent.update({
      where: { id: ev.id },
      data: { createdAt: date }
    });
    // Also update the inventory item
    const evtRow = await prisma.supplyChainEvent.findUnique({ where: { id: ev.id } });
    if (evtRow && evtRow.inventoryItemId) {
      await prisma.inventoryItem.update({
        where: { id: evtRow.inventoryItemId },
        data: { createdAt: date }
      });
    }
  }

  // Process a significant chunk of these catches
  const dbInventoryCatches = await prisma.inventoryItem.findMany({ where: { status: "IN_STORAGE" } });
  
  for(let i = 0; i < 60; i++) {
    if(!dbInventoryCatches[i]) break;
    const isProc1 = Math.random() > 0.5;
    const ptDate = new Date(Math.min(new Date(dbInventoryCatches[i].createdAt).getTime() + (Math.random() * 10 * 86400000), now - 3 * 86400000)).toISOString(); // Clamped to 3 days ago max
    
    const ev = await eventService.createEvent(isProc1 ? processorOrg.id : processorOrg2.id, isProc1 ? processorUser.id : processorUser2.id, {
        type: "PROCESSING",
        data: {
            inputBatchIds: [dbInventoryCatches[i].sku],
            outputLotNumber: `LOT-P-${i}-${Date.now().toString().slice(-4)}`,
            processingYieldPct: Math.floor(Math.random() * 25 + 65), // 65% to 90%
            qcCertificateHash: "ipfs://...",
        }
    });
    
    await prisma.supplyChainEvent.update({
      where: { id: ev.id },
      data: { createdAt: ptDate }
    });
    
    const evtRow = await prisma.supplyChainEvent.findUnique({ where: { id: ev.id } });
    if (evtRow && evtRow.inventoryItemId) {
      await prisma.inventoryItem.update({
        where: { id: evtRow.inventoryItemId },
        data: { createdAt: ptDate }
      });
    }
  }

  // Ship processed items downstream
  const dbProcessed = await prisma.inventoryItem.findMany({ where: { status: "IN_STORAGE", sku: { startsWith: 'LOT' } } });
  for(let i = 0; i < 40; i++){
    if(!dbProcessed[i]) break;
    const isLog1 = Math.random() > 0.5;
    const isHubToHub = Math.random() > 0.6;
    const dDate = new Date(Math.min(new Date(dbProcessed[i].createdAt).getTime() + (Math.random() * 7 * 86400000), now - 86400000)).toISOString(); // Clamped to 1 day ago max

    const ev = await eventService.createEvent(isLog1 ? logisticsOrg.id : logisticsOrg2.id, isLog1 ? logisticsUser.id : logisticsUser2.id, {
        type: "CUSTODY_TRANSFER",
        data: {
            sku: dbProcessed[i].sku,
            carrierId: isLog1 ? "MAERSK" : "CMA-CGM",
            vehiclePlate: `TRK-${Math.floor(Math.random()*9000)+1000}`,
            handoverFrom: Math.random() > 0.5 ? "Chennai Processing Hub" : "Kochi Value Add",
            handoverTo: isHubToHub ? "Global Seafood Buyers" : (isLog1 ? "Maersk Distribution Center" : "CMA Metro Facility")
        }
    });
    
    await prisma.supplyChainEvent.update({
      where: { id: ev.id },
      data: { createdAt: dDate }
    });
  }

  console.log("Seeding complete! You can now log in with the following accounts (Password for all is 'password123'):");
  console.log("Admin: admin@captainfresh.com");
  console.log("Supplier: supplier@oceanic.com");
  console.log("Processor: processor@chennaiprime.com");
  console.log("Logistics: driver@maersk.com");
  console.log("Buyer: buyer@global.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
