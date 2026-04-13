import { prisma } from "../../config/database.js";
import { NotFoundError } from "../../shared/errors.js";
import { parsePagination } from "../../shared/types.js";
import type { ListInventoryQuery } from "./inventory.schema.js";
import type { Prisma, ItemStatus } from "@prisma/client";

// ── List Inventory ─────────────────────────────────────────

export async function listInventory(query: ListInventoryQuery) {
  const { page, limit, skip } = parsePagination(query);

  const where: Prisma.InventoryItemWhereInput = {};

  if (query.status) {
    where.status = query.status as ItemStatus;
  }
  if (query.sku) {
    where.sku = { contains: query.sku, mode: "insensitive" };
  }

  const [items, total] = await prisma.$transaction([
    prisma.inventoryItem.findMany({
      where,
      include: {
        owner: {
          select: { name: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.inventoryItem.count({ where }),
  ]);

  return {
    items: items.map((i) => ({
      id: i.id,
      sku: i.sku,
      species: i.species,
      volumeKg: i.volumeKg,
      location: i.location,
      status: i.status,
      certifications: i.certifications,
      expiryDate: i.expiryDate,
      owner: {
        id: i.ownerId,
        name: i.owner.name,
        role: i.owner.role,
      },
      createdAt: i.createdAt,
    })),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ── Traceability Lifecycle ─────────────────────────────────

export async function getTraceability(sku: string) {
  const item = await prisma.inventoryItem.findUnique({
    where: { sku },
    include: {
      owner: { select: { name: true, role: true } },
      events: {
        include: {
          org: { select: { name: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!item) {
    throw new NotFoundError(`SKU ${sku} not found`);
  }

  // Find parent events if this is a processed lot
  let parentEvents: any[] = [];
  if (item.events.length > 0 && item.events[0].type === "PROCESSING") {
    const procData = item.events[0].data as any;
    if (procData.inputBatchIds) {
      const parentItems = await prisma.inventoryItem.findMany({
        where: { sku: { in: procData.inputBatchIds } },
        include: {
          events: {
            include: { org: { select: { name: true, role: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      });
      // Flatten all parent events before this item's creation
      parentItems.forEach((pi) => {
        parentEvents = parentEvents.concat(pi.events);
      });
    }
  }

  // Deduplicate and sort events chronologically
  const allEvents = [...parentEvents, ...item.events]
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i); // Deduplicate by ID

  return {
    currentInfo: {
      id: item.id,
      sku: item.sku,
      species: item.species,
      volumeKg: item.volumeKg,
      location: item.location,
      status: item.status,
      owner: item.owner.name,
      createdAt: item.createdAt,
    },
    lifecycle: allEvents.map((e) => ({
      eventId: e.id,
      type: e.type,
      txHash: e.txHash,
      orgName: e.org.name,
      orgRole: e.org.role,
      date: e.createdAt,
      data: e.data,
    })),
  };
}
