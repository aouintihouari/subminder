import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import "dotenv/config";
import { initSentry } from "./modules/shared/config/sentry";

initSentry();

import app from "./app";
import { logger } from "./modules/shared/lib/logger";
import { initCronJobs } from "./modules/shared/services/cron.service";
import { exchangeRateService } from "./modules/shared/services/exchangeRate.service";

process.on("uncaughtException", (err: Error) => {
  logger.fatal(err, "UNCAUGHT EXCEPTION! 💥 Shutting down...");
  process.exit(1);
});

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  logger.info(`🚀 SubMinder Backend running on port ${PORT} and host ${HOST}`);
  initCronJobs();
  exchangeRateService
    .getRates()
    .then(() => logger.info("💰 Initial exchange rates loaded"))
    .catch((err) => logger.error(err, "⚠️ Failed to load initial rates"));
});

process.on("unhandledRejection", (err: Error) => {
  logger.error(err, "UNHANDLED REJECTION! 💥 Shutting down...");
  server.close(() => process.exit(1));
});

const shutdown = () => {
  logger.info("SIGTERM/SIGINT received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Process terminated.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
