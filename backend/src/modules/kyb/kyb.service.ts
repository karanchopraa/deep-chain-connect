import { prisma } from "../../config/database.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../../shared/errors.js";
import type { ReviewKybInput } from "./kyb.schema.js";

// ── Get KYB Status ─────────────────────────────────────────

export async function getStatus(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      kybDocuments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!org) {
    throw new NotFoundError("Organization not found");
  }

  return {
    orgId: org.id,
    orgName: org.name,
    orgStatus: org.status,
    documents: org.kybDocuments.map((doc) => ({
      id: doc.id,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      status: doc.status,
      reviewNote: doc.reviewNote,
      uploadedAt: doc.createdAt,
    })),
    submittedAt: org.createdAt,
  };
}

// ── Upload Document ────────────────────────────────────────

export async function uploadDocument(
  orgId: string,
  file: {
    originalname: string;
    mimetype: string;
    path: string;
    size: number;
  },
) {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) {
    throw new NotFoundError("Organization not found");
  }

  // Only allow uploads when KYB is pending or rejected (re-upload)
  if (org.status === "ACTIVE") {
    throw new BadRequestError("KYB already approved. No further documents needed.");
  }

  const doc = await prisma.kybDocument.create({
    data: {
      orgId,
      fileName: file.originalname,
      fileType: file.mimetype,
      filePath: file.path,
      fileSize: file.size,
      status: "PENDING",
    },
  });

  // Move org to KYB_UNDER_REVIEW if it was just pending
  if (org.status === "KYB_PENDING" || org.status === "INVITED") {
    await prisma.organization.update({
      where: { id: orgId },
      data: { status: "KYB_UNDER_REVIEW" },
    });
  }

  return {
    id: doc.id,
    fileName: doc.fileName,
    fileType: doc.fileType,
    fileSize: doc.fileSize,
    status: doc.status,
    uploadedAt: doc.createdAt,
  };
}

// ── Admin Review ───────────────────────────────────────────

export async function reviewOrg(
  targetOrgId: string,
  reviewerUserId: string,
  input: ReviewKybInput,
) {
  const org = await prisma.organization.findUnique({
    where: { id: targetOrgId },
    include: { kybDocuments: true },
  });

  if (!org) {
    throw new NotFoundError("Organization not found");
  }

  if (org.status === "ACTIVE" && input.status === "APPROVED") {
    throw new BadRequestError("Organization is already active");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Update all pending documents
    await tx.kybDocument.updateMany({
      where: {
        orgId: targetOrgId,
        status: "PENDING",
      },
      data: {
        status: input.status,
        reviewedBy: reviewerUserId,
        reviewNote: input.reviewNote,
      },
    });

    // Update org status
    const newOrgStatus = input.status === "APPROVED" ? "ACTIVE" : "KYB_PENDING";
    const updatedOrg = await tx.organization.update({
      where: { id: targetOrgId },
      data: { status: newOrgStatus },
    });

    return updatedOrg;
  });

  return {
    orgId: result.id,
    orgName: result.name,
    newStatus: result.status,
    reviewedBy: reviewerUserId,
    reviewNote: input.reviewNote,
  };
}
