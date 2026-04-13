import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/database.js";

async function main() {
  // Verify database connection
  try {
    await prisma.$connect();
    console.log("✓ Database connected");
  } catch (err) {
    console.error("✗ Database connection failed:", err);
    process.exit(1);
  }

  // Start server
  app.listen(env.port, "0.0.0.0", () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║   Deep Chain Connect — Backend API               ║
║──────────────────────────────────────────────────║
║   Status:      Running                           ║
║   Port:        ${String(env.port).padEnd(37)}║
║   Environment: ${env.nodeEnv.padEnd(37)}║
║   Health:      http://localhost:${env.port}/api/health     ║
╚══════════════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
