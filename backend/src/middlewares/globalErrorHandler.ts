import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

import { AppError } from "../utils/AppError";

const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let status = "error";
  let message = err.message;
  let errors = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    status = err.status;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    status = "fail";
    message = "Validation failed";
    errors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  } else if ((err as any).code === "P2002") {
    statusCode = 409;
    status = "fail";
    message = "An entity already exists with this attribute";
  }

  res.status(statusCode).json({
    status,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default globalErrorHandler;
