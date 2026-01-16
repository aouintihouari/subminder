import { z } from "zod";

const expenseBodySchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3).default("EUR"),
  date: z.iso.datetime({ offset: true }).or(z.date()),
  description: z.string().max(500).optional(),
  categoryId: z.number().int().positive("Category ID is required"),
});

export const createExpenseSchema = z.object({
  body: expenseBodySchema,
});

export const updateExpenseSchema = z.object({
  body: expenseBodySchema.partial(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>["body"];
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>["body"];
