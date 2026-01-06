import express, { Application, Request, Response } from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cron from "node-cron";

import authRoutes from "./routes/auth.routes";
import subscriptionRoutes from "./routes/subscription.routes";

import globalErrorHandler from "./middlewares/globalErrorHandler";
import { AppError } from "./utils/AppError";
import { cronService } from "./services/cron.service";

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(hpp());

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser() as any);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);

app.get("/", (_: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "SubMinder API is running securely! 🚀",
    env: process.env.NODE_ENV,
  });
});

cron.schedule("0 9 * * *", () => {
  console.log("⏰ Triggering Daily Renewal Check...");
  cronService.checkUpcomingRenewals();
});

console.log("✅ Scheduler initialized: Job set for 09:00 AM daily.");

app.all("*", (req: Request, _: Response) => {
  throw new AppError(`Route ${req.originalUrl} not found`, 404);
});

app.use(globalErrorHandler);

export default app;
