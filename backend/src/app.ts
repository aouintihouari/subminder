import express, { Application, Request, Response } from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(hpp());

app.use(express.json({ limit: "10kb" }));

app.get("/", (_: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "SubMinder API is running securely! 🚀",
    env: process.env.NODE_ENV,
  });
});

app.all("*", (req: Request, res: Response) => {
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

export default app;
