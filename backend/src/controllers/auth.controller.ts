import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { prisma } from "../lib/prisma";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/authSchema";
import { AppError } from "../utils/AppError";
import { emailService } from "../services/email.service";
import { signToken, getCookieOptions } from "../utils/jwt.utils";
import {
  EMAIL_VERIFICATION_EXPIRES_IN_MS,
  PASSWORD_RESET_EXPIRES_IN_MS,
} from "../config/constants";
import { logger } from "../lib/logger";

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user.id);
  const cookieOptions = getCookieOptions();
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({ status: "success", data: { user } });
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  const validated = signupSchema.parse({ body: req.body });
  const { email, password, name } = validated.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError("This email is already in use", 409);

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiresAt = new Date(
    Date.now() + EMAIL_VERIFICATION_EXPIRES_IN_MS
  );

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt,
      isVerified: false,
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  await emailService.sendVerificationEmail(
    newUser.email,
    newUser.name || "User",
    verificationToken
  );

  res.status(201).json({
    status: "success",
    message:
      "User registered successfully. Please check your email to verify your account.",
    data: { user: newUser },
  });
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.body;
  if (!token) throw new AppError("Verification token is missing", 400);

  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) throw new AppError("Invalid or expired verification token", 400);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Email verified successfully! You can now log in.",
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const validated = loginSchema.parse({ body: req.body });
  const { email, password } = validated.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new AppError("Invalid email or password", 401);

  if (!user.isVerified)
    throw new AppError("Please verify your email to log in", 403);

  sendTokenResponse(user, 200, res);
};

export const logout = (_: Request, res: Response) => {
  const cookieOptions = getCookieOptions();

  res.cookie("jwt", "loggedout", {
    ...cookieOptions,
    expires: new Date(Date.now() + 10),
  });

  res.status(200).json({ status: "success" });
};

export const getMe = async (req: Request, res: Response) => {
  res.status(200).json({ status: "success", data: { user: req.user } });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse({ body: req.body }).body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user)
    return res.status(200).json({
      status: "success",
      message: "If this email exists, a reset link has been sent.",
    });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken,
      passwordResetExpires: new Date(Date.now() + PASSWORD_RESET_EXPIRES_IN_MS),
    },
  });

  try {
    await emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.name || "User"
    );
    res.status(200).json({
      status: "success",
      message: "If this email exists, a reset link has been sent.",
    });
  } catch (err) {
    logger.error(err, "❌ Failed to send password reset email");

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: null, passwordResetExpires: null },
    });

    throw new AppError("Error sending email. Please try again later.", 500);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) throw new AppError("Token is invalid or has expired.", 400);

  const { password } = resetPasswordSchema.parse({ body: req.body }).body;
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Password successfully reset! You can now log in.",
  });
};
