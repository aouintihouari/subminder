import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: string };
    }
  }
}

export const protect = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  let token;

  if (req.cookies.jwt) token = req.cookies.jwt;
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  )
    token = req.headers.authorization.split(" ")[1];

  if (!token)
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      iat: number;
    };

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!currentUser)
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );

    req.user = currentUser;
    next();
  } catch (err) {
    return next(new AppError("Invalid token. Please log in again.", 401));
  }
};
