import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";
import { signupSchema } from "../schemas/authSchema";
import { AppError } from "../utils/AppError";

export const signup = async (req: Request, res: Response): Promise<void> => {
  const validated = signupSchema.parse({ body: req.body });
  const { email, password, name } = validated.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError("This email is already in use", 409);

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: { email, password: hashedPassword, name },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  res.status(201).json({ status: "success", data: { user: newUser } });
};
