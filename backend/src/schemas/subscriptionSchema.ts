import { z } from "zod";
import { Frequency, Category } from "@prisma/client";

const subscriptionBodySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(100),
  price: z.number().min(0, { message: "Price must be positive" }),
  currency: z.string().length(3).default("EUR"),
  frequency: z.enum(Frequency, {
    message: "Invalid frequency (WEEKLY, MONTHLY, YEARLY, ONCE)",
  }),
  category: z.enum(Category, {
    message: "Invalid category",
  }),
  startDate: z.iso.datetime({ offset: true }).or(z.string().date()),
  isActive: z.boolean().optional().default(true),
});

export const createSubscriptionSchema = z.object({
  body: subscriptionBodySchema,
});

export type CreateSubscriptionInput = z.infer<typeof subscriptionBodySchema>;
