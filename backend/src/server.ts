import { createServer } from "http";
import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { logger } from "./config/logger.js";
import { initSentry } from "./config/sentry.js";
import { createApp } from "./app.js";
import { initSockets } from "./sockets/index.js";

initSentry();

const app = createApp();
const httpServer = createServer(app);
initSockets(httpServer);

async function bootstrap(): Promise<void> {
  await connectDB();

  httpServer.listen(env.PORT, () => {
    logger.info("InterviewForge API listening", {
      port: env.PORT,
      environment: env.NODE_ENV
    });
  });
}

function shutdown(signal: string): void {
  logger.info("Shutdown signal received", { signal });
  httpServer.close(() => {
    void disconnectDB().finally(() => {
      process.exit(0);
    });
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

void bootstrap().catch((error) => {
  logger.error("Failed to start API", {
    error: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined
  });
  process.exit(1);
});

