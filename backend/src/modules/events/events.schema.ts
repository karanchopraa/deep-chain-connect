import { z } from "zod";

// ── Catch Event (Supplier) ─────────────────────────────────

const catchDataSchema = z.object({
  vesselName: z.string().min(1, "Vessel name is required").max(255),
  species: z.string().min(1, "Species is required").max(255),
  gpsLat: z.number().min(-90).max(90),
  gpsLon: z.number().min(-180).max(180),
  weightKg: z.number().positive("Weight must be positive"),
  catchDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date format"),
  fishingMethod: z.string().min(1, "Fishing method is required").max(255),
});

// ── Processing Event (Processor) ───────────────────────────

const processingDataSchema = z.object({
  inputBatchIds: z.array(z.string().min(1)).min(1, "At least one input batch ID required"),
  outputLotNumber: z.string().min(1, "Output lot number is required").max(100),
  processingYieldPct: z.number().min(0).max(100, "Yield must be between 0 and 100"),
  qcCertificateHash: z.string().optional(), // IPFS hash when file uploaded
});

// ── Custody Transfer Event (Logistics) ─────────────────────

const custodyTransferDataSchema = z.object({
  sku: z.string().min(1, "SKU to transfer is required"),
  carrierId: z.string().min(1, "Carrier ID is required").max(100),
  vehiclePlate: z.string().min(1, "Vehicle/Container plate is required").max(100),
  handoverFrom: z.string().min(1, "Handover from is required").max(255),
  handoverTo: z.string().min(1, "Handover to is required").max(255),
  tempLogHash: z.string().optional(), // IPFS hash when file uploaded
});

// ── Create Event (discriminated union) ─────────────────────

export const createEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("CATCH"),
    data: catchDataSchema,
  }),
  z.object({
    type: z.literal("PROCESSING"),
    data: processingDataSchema,
  }),
  z.object({
    type: z.literal("CUSTODY_TRANSFER"),
    data: custodyTransferDataSchema,
  }),
]);

export type CreateEventInput = z.infer<typeof createEventSchema>;

// ── Query params ───────────────────────────────────────────

export const listEventsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  type: z.enum(["CATCH", "PROCESSING", "CUSTODY_TRANSFER"]).optional(),
  orgId: z.string().uuid().optional(),
});

export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
