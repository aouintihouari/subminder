import { PrismaClient } from "@prisma/client";
import { prisma } from "../shared/lib/prisma";
import { AppError } from "../shared/utils/AppError";
import { CreateCategoryInput } from "./category.schema";

export class CategoryService {
  constructor(private db: PrismaClient) {}

  async getAll(userId: number) {
    return await this.db.category.findMany({
      where: { OR: [{ isSystem: true }, { userId: userId }] },
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    });
  }

  async create(userId: number, data: CreateCategoryInput) {
    const slug =
      data.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    const existing = await this.db.category.findFirst({
      where: { userId, name: { equals: data.name, mode: "insensitive" } },
    });

    if (existing)
      throw new AppError("You already have a category with this name", 409);

    return await this.db.category.create({
      data: { ...data, slug, userId, isSystem: false },
    });
  }

  async delete(userId: number, categoryId: number) {
    const category = await this.db.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) throw new AppError("Category not found", 404);

    if (category.isSystem)
      throw new AppError("You cannot delete a system category", 403);

    if (category.userId !== userId) throw new AppError("Access denied", 403);

    await this.db.category.delete({ where: { id: categoryId } });

    return { message: "Category deleted successfully" };
  }
}

export const categoryService = new CategoryService(prisma);
