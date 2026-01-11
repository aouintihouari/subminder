import jwt from "jsonwebtoken";
import { CookieOptions } from "express";
import { COOKIE_EXPIRES_IN_DAYS } from "../config/constants";

export const signToken = (id: number): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "90d") as any,
  });
};

export const getCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === "production";
  const isSecureProtocol = process.env.FRONTEND_URL?.startsWith("https");

  return {
    expires: new Date(
      Date.now() + COOKIE_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: isProduction || isSecureProtocol,
    sameSite: isProduction ? "none" : "lax",
  };
};
