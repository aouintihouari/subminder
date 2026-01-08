import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

export class UserService {
  constructor(private db: PrismaClient) {}

  async updateProfile(userId: number, data: { name?: string }) {
    return await this.db.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true },
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
}

export const userService = new UserService(prisma);
