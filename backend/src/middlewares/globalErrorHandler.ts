import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

import { AppError } from "../utils/AppError";

const globalErrorHandler = (
  err: any,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Something went wrong";
  let errors = undefined;

  if (err instanceof ZodError) {
    statusCode = 400;
    status = "fail";
    message = "Validation failed";
    errors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  } else if (err.code === "P2002") {
    statusCode = 409;
    status = "fail";
    const target = (err.meta?.target as string[]) || "field";
    message = `An entity already exists with this value in: ${target}`;
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    status = "fail";
    message = "Invalid token. Please log in again.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    status = "fail";
    message = "Your token has expired. Please log in again.";
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    status = err.status;
    message = err.message;
  }

  if (process.env.NODE_ENV === "development") {
    res
      .status(statusCode)
      .json({ status, message, errors, stack: err.stack, error: err });
  } else {
    if (statusCode !== 500)
      res
        .status(statusCode)
        .json({ status, message, ...(errors && { errors }) });
    else {
      console.error("ERROR 💥", err);

      res
        .status(500)
        .json({ status: "error", message: "Something went wrong!" });
    }
  }
};

export default globalErrorHandler;
