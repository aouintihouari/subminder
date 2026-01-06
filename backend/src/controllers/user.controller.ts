import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { updateMeSchema, updatePasswordSchema } from "../schemas/userSchema";

/**
 * Update current user profile (Name only for now)
 * @route PATCH /api/v1/users/me
 */
export const updateMe = async (req: Request, res: Response) => {
  const validated = updateMeSchema.parse({ body: req.body });
  const { name } = validated.body;

  const updatedUser = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name },
    select: { id: true, name: true, email: true, role: true },
  });

  res.status(200).json({ status: "success", data: { user: updatedUser } });
};

/**
 * Update password
 * @route PATCH /api/v1/users/update-password
 */
export const updatePassword = async (req: Request, res: Response) => {
  const validated = updatePasswordSchema.parse({ body: req.body });
  const { currentPassword, newPassword } = validated.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });
  if (!user) throw new AppError("User not found", 404);

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password
  );
  if (!isPasswordCorrect) throw new AppError("Incorrect current password", 401);

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  res
    .status(200)
    .json({ status: "success", message: "Password updated successfully" });
};

/**
 * Delete current user account
 * @route DELETE /api/v1/users/me
 */
export const deleteMe = async (req: Request, res: Response) => {
  await prisma.user.delete({ where: { id: req.user!.id } });

  res.status(204).json({ status: "success", data: null });
};
