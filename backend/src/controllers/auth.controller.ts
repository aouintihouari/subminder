import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { prisma } from "../lib/prisma";
import { signupSchema } from "../schemas/authSchema";
import { AppError } from "../utils/AppError";
import { emailService } from "../services/email.service";

export const signup = async (req: Request, res: Response): Promise<void> => {
  const validated = signupSchema.parse({ body: req.body });
  const { email, password, name } = validated.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError("This email is already in use", 409);

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

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

  res
    .status(200)
    .json({
      status: "success",
      message: "Email verified successfully! You can now log in.",
    });
};
