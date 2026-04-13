import crypto from "crypto";
import { prisma } from "../../config/database.js";
import { NotFoundError } from "../../shared/errors.js";
import { parsePagination } from "../../shared/types.js";
import type { CreateEventInput, ListEventsQuery } from "./events.schema.js";
import type { EventType, Prisma } from "@prisma/client";

// ── Mock Tx Hash Generator ─────────────────────────────────
// Generates a deterministic-looking hash from event data.
// Will be replaced with real Fabric SDK calls when blockchain is integrated.

function generateMockTxHash(data: unknown): string {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(data) + Date.now().toString())
    .digest("hex");
  return `0x${hash}`;
}

// ── Create Event ───────────────────────────────────────────

function generateSku(prefix: string) {
  return `${prefix}-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000000).toString().padStart(6, "0")}`;
}

export async function createEvent(
  orgId: string,
  userId: string,
  input: CreateEventInput,
) {
  const txHash = generateMockTxHash(input.data);

  return prisma.$transaction(async (tx) => {
    let inventoryItemId: string | null = null;

    if (input.type === "CATCH") {
      const data = input.data as any;
      const sku = generateSku("CATCH");
      const newItem = await tx.inventoryItem.create({
        data: {
          sku,
          species: data.species,
          volumeKg: data.weightKg,
          location: `Lat: ${data.gpsLat}, Lon: ${data.gpsLon}`,
          status: "IN_STORAGE",
          ownerId: orgId,
        },
      });
      inventoryItemId = newItem.id;
    } else if (input.type === "PROCESSING") {
      const data = input.data as any;
      const inputBatchId = data.inputBatchIds[0];

      // Look up input item
      const inputItem = await tx.inventoryItem.findFirst({
        where: { sku: inputBatchId },
      });

      if (!inputItem) throw new NotFoundError(`Input batch ${inputBatchId} not found`);

      // Mark input as processed
      await tx.inventoryItem.update({
        where: { id: inputItem.id },
        data: { status: "PROCESSED" },
      });

      // Create output lot with a unique SKU derived from the user's lot number
      const uniqueLotSku = `${data.outputLotNumber}-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
      const newItem = await tx.inventoryItem.create({
        data: {
          sku: uniqueLotSku,
          species: inputItem.species,
          volumeKg: inputItem.volumeKg * (data.processingYieldPct / 100),
          location: `Processing Facility (${orgId})`,
          status: "IN_STORAGE",
          ownerId: orgId,
          certifications: data.qcCertificateHash,
        },
      });
      inventoryItemId = newItem.id;
    } else if (input.type === "CUSTODY_TRANSFER") {
      const data = input.data as any;
      const item = await tx.inventoryItem.findFirst({
        where: { sku: data.sku },
      });
      if (!item) throw new NotFoundError(`SKU ${data.sku} not found`);

      // Update location and owner (since it's typically transferring to someone else or in transit)
      const updatedItem = await tx.inventoryItem.update({
        where: { id: item.id },
        data: {
          status: "IN_TRANSIT",
          location: `In Transit - ${data.carrierId} (${data.vehiclePlate})`,
          // Note: In a fully fleshed system, handoverTo would resolve to the actual DB Org ID.
          // For now, we update the status context.
        },
      });
      inventoryItemId = updatedItem.id;
    }

    const event = await tx.supplyChainEvent.create({
      data: {
        type: input.type,
        orgId,
        submittedBy: userId,
        txHash,
        inventoryItemId,
        data: input.data as Prisma.InputJsonValue,
        status: "COMMITTED",
      },
      include: {
        org: { select: { name: true, role: true } },
      },
    });

    return {
      id: event.id,
      type: event.type,
      txHash: event.txHash,
      status: event.status,
      data: event.data,
      organization: {
        id: event.orgId,
        name: event.org.name,
        role: event.org.role,
      },
      submittedBy: event.submittedBy,
      createdAt: event.createdAt,
    };
  });
}

// ── List Events ────────────────────────────────────────────

export async function listEvents(query: ListEventsQuery) {
  const { page, limit, skip } = parsePagination(query);

  const where: Prisma.SupplyChainEventWhereInput = {};

  if (query.type) {
    where.type = query.type as EventType;
  }
  if (query.orgId) {
    where.orgId = query.orgId;
  }

  const [events, total] = await prisma.$transaction([
    prisma.supplyChainEvent.findMany({
      where,
      include: {
        org: {
          select: { name: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.supplyChainEvent.count({ where }),
  ]);

  return {
    events: events.map((e) => ({
      id: e.id,
      type: e.type,
      txHash: e.txHash,
      status: e.status,
      data: e.data,
      organization: {
        id: e.orgId,
        name: e.org.name,
        role: e.org.role,
      },
      submittedBy: e.submittedBy,
      createdAt: e.createdAt,
    })),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ── Get Event Detail ───────────────────────────────────────

export async function getEventById(eventId: string) {
  const event = await prisma.supplyChainEvent.findUnique({
    where: { id: eventId },
    include: {
      org: {
        select: { name: true, role: true },
      },
    },
  });

  if (!event) {
    throw new NotFoundError("Supply chain event not found");
  }

  return {
    id: event.id,
    type: event.type,
    txHash: event.txHash,
    status: event.status,
    data: event.data,
    organization: {
      id: event.orgId,
      name: event.org.name,
      role: event.org.role,
    },
    submittedBy: event.submittedBy,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}
