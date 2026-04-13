import dotenv from "dotenv";
dotenv.config();

export const env = {
  // Server
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: (process.env.NODE_ENV || "development") === "development",

  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // JWT
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",

  // File Uploads
  uploadDir: process.env.UPLOAD_DIR || "./uploads",
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10),

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:8080",
} as const;

// Validate required env vars at startup
const required = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
