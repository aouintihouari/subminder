import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

export class UserService {
  constructor(private db: PrismaClient) {}

  async updateProfile(
    userId: number,
    data: { name?: string; preferredCurrency?: string }
  ) {
    return await this.db.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        preferredCurrency: true,
      },
    });
  }

  async updatePassword(userId: number, current: string, newPass: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new AppError("User not found", 404);

    const isPasswordCorrect = await bcrypt.compare(current, user.password);
    if (!isPasswordCorrect)
      throw new AppError("Incorrect current password", 401);

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPass, salt);

    await this.db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async deleteUser(userId: number) {
    await this.db.user.delete({ where: { id: userId } });
  }

  async requestEmailChange(userId: number, newEmail: string) {
    const existingUser = await this.db.user.findUnique({
      where: { email: newEmail },
    });
    if (existingUser) throw new AppError("Email already in use", 400);

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const user = await this.db.user.update({
      where: { id: userId },
      data: {
        newEmail,
        emailChangeToken: hashedToken,
        emailChangeExpires: expiresAt,
      },
    });

    return { user, token: resetToken };
  }

  async verifyEmailChange(token: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await this.db.user.findFirst({
      where: {
        emailChangeToken: hashedToken,
        emailChangeExpires: { gt: new Date() },
      },
    });

    if (!user || !user.newEmail)
      throw new AppError("Token is invalid or has expired", 400);

    return await this.db.user.update({
      where: { id: user.id },
      data: {
        email: user.newEmail,
        newEmail: null,
        emailChangeToken: null,
        emailChangeExpires: null,
      },
    });
  }
}

export const userService = new UserService(prisma);
