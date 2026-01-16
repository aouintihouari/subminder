import { PrismaClient } from "@prisma/client";
import { prisma } from "../shared/lib/prisma";
import { AppError } from "../shared/utils/AppError";
import { CreateExpenseInput, UpdateExpenseInput } from "./expense.schema";

export class ExpenseService {
  constructor(private db: PrismaClient) {}

  async create(userId: number, data: CreateExpenseInput) {
    const category = await this.db.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) throw new AppError("Category not found", 404);

    return await this.db.expense.create({
      data: { ...data, userId },
      include: { category: true },
    });
  }

  async getAll(userId: number) {
    return await this.db.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      include: { category: true },
    });
  }

  async getOne(userId: number, expenseId: number) {
    const expense = await this.db.expense.findUnique({
      where: { id: expenseId },
      include: { category: true },
    });

    if (!expense || expense.userId !== userId)
      throw new AppError("Expense not found", 404);

    return expense;
  }

  async update(userId: number, expenseId: number, data: UpdateExpenseInput) {
    await this.getOne(userId, expenseId);

    return await this.db.expense.update({
      where: { id: expenseId },
      data,
      include: { category: true },
    });
  }

  async delete(userId: number, expenseId: number) {
    await this.getOne(userId, expenseId);

    await this.db.expense.delete({ where: { id: expenseId } });

    return { message: "Expense deleted successfully" };
  }
}

export const expenseService = new ExpenseService(prisma);
