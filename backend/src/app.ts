import express, { Application, Request, Response } from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import authRoutes from "./routes/auth.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import userRoutes from "./routes/user.routes";

import globalErrorHandler from "./middlewares/globalErrorHandler";
import { AppError } from "./utils/AppError";
import { cronService } from "./services/cron.service";
import { exchangeRateService } from "./services/exchangeRate.service";

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(hpp());

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser() as any);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);

app.get("/", (_: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "SubMinder API is running securely! 🚀",
    env: process.env.NODE_ENV,
  });
});

cron.schedule("0 8 * * *", () => {
  cronService.handleDailyRatesUpdate();
});

cron.schedule("0 9 * * *", () => {
  console.log("⏰ Triggering Daily Renewal Check...");
  cronService.checkUpcomingRenewals();
});

console.log("✅ Scheduler initialized: Job set for 09:00 AM daily.");
console.log("✅ Scheduler initialized: Rates at 08:00, Renewals at 09:00.");

exchangeRateService
  .getRates()
  .then(() => console.log("💰 Initial exchange rates loaded"))
  .catch((err) =>
    console.error("⚠️ Failed to load initial rates:", err.message)
  );

app.all("*", (req: Request, _: Response) => {
  throw new AppError(`Route ${req.originalUrl} not found`, 404);
});

app.use(globalErrorHandler);

export default app;
