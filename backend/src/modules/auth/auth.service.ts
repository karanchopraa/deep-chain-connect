import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../../shared/errors.js";
import type { JwtPayload } from "../../shared/types.js";
import type { RegisterInput, LoginInput } from "./auth.schema.js";

const SALT_ROUNDS = 12;

// ── Token Generation ───────────────────────────────────────

function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiry as any,
  });
}

function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString("hex");
}

function parseExpiry(expiry: string): Date {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) {
    // Default 7 days
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return new Date(Date.now() + value * multipliers[unit]);
}

// ── Register ───────────────────────────────────────────────

export async function register(input: RegisterInput) {
  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  // Create org + user in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: input.organizationName,
        role: input.organizationRole,
        status: "KYB_PENDING",
      },
    });

    const user = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        orgId: org.id,
      },
    });

    return { org, user };
  });

  // Generate token pair
  const jwtPayload: JwtPayload = {
    userId: result.user.id,
    orgId: result.org.id,
    orgRole: result.org.role,
    email: result.user.email,
  };

  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken();

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: result.user.id,
      expiresAt: parseExpiry(env.jwtRefreshExpiry),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
    },
    organization: {
      id: result.org.id,
      name: result.org.name,
      role: result.org.role,
      status: result.org.status,
    },
  };
}

// ── Login ──────────────────────────────────────────────────

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { org: true },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Check org status
  if (user.org.status === "SUSPENDED") {
    throw new UnauthorizedError("Your organization has been suspended");
  }

  // Generate token pair
  const jwtPayload: JwtPayload = {
    userId: user.id,
    orgId: user.org.id,
    orgRole: user.org.role,
    email: user.email,
  };

  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken();

  // Store refresh token (clean up expired tokens for this user)
  await prisma.$transaction([
    prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
        expiresAt: { lt: new Date() },
      },
    }),
    prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: parseExpiry(env.jwtRefreshExpiry),
      },
    }),
  ]);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    organization: {
      id: user.org.id,
      name: user.org.name,
      role: user.org.role,
      status: user.org.status,
    },
  };
}

// ── Refresh Token ──────────────────────────────────────────

export async function refresh(token: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token },
    include: {
      user: {
        include: { org: true },
      },
    },
  });

  if (!stored) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  if (stored.expiresAt < new Date()) {
    // Clean up expired token
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw new UnauthorizedError("Refresh token expired");
  }

  const { user } = stored;

  // Rotate: delete old, create new
  const newRefreshToken = generateRefreshToken();

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: stored.id } }),
    prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: parseExpiry(env.jwtRefreshExpiry),
      },
    }),
  ]);

  const jwtPayload: JwtPayload = {
    userId: user.id,
    orgId: user.org.id,
    orgRole: user.org.role,
    email: user.email,
  };

  return {
    accessToken: generateAccessToken(jwtPayload),
    refreshToken: newRefreshToken,
  };
}

// ── Logout ─────────────────────────────────────────────────

export async function logout(token: string) {
  await prisma.refreshToken.deleteMany({
    where: { token },
  });
}

// ── Get Current User ───────────────────────────────────────

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { org: true },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    organization: {
      id: user.org.id,
      name: user.org.name,
      role: user.org.role,
      status: user.org.status,
    },
  };
}
