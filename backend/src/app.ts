import express, { Application, Request, Response } from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import * as Sentry from "@sentry/node";

import authRoutes from "./modules/auth/auth.route";
import subscriptionRoutes from "./modules/subscriptions/subscription.route";
import userRoutes from "./modules/users/user.route";
import categoryRoutes from "./modules/categories/category.route";
import expenseRoutes from "./modules/expenses/expense.route";

import globalErrorHandler from "./modules/shared/middlewares/globalErrorHandler";
import { AppError } from "./modules/shared/utils/AppError";
import { logger } from "./modules/shared/lib/logger";

const app: Application = express();

app.use(pinoHttp({ logger }));

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again in 15 minutes",
});
app.use(limiter);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser() as any);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/expenses", expenseRoutes);

app.get("/", (_: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "SubMinder API is running securely! 🚀",
    env: process.env.NODE_ENV,
  });
});

app.all("*", (req: Request, _: Response) => {
  throw new AppError(`Route ${req.originalUrl} not found`, 404);
});

Sentry.setupExpressErrorHandler(app);

app.use(globalErrorHandler);

export default app;
