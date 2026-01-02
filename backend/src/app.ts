import express, { Application, Request, Response } from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";

import authRoutes from "./routes/auth.routes";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import { AppError } from "./utils/AppError";

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(hpp());

app.use(express.json({ limit: "10kb" }));

app.use("/api/v1/auth", authRoutes);

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

app.use(globalErrorHandler);

export default app;
