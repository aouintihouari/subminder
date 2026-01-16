import { z } from "zod";
import { Frequency } from "@prisma/client";

const subscriptionBodySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(100),
  price: z.number().min(0, { message: "Price must be positive" }),
  currency: z.string().length(3).default("EUR"),
  frequency: z.nativeEnum(Frequency),
  categoryId: z
    .number()
    .int()
    .positive({ message: "Valid Category ID is required" }),
  startDate: z.iso.datetime({ offset: true }).or(z.string().date()),
  isActive: z.boolean().optional().default(true),
  description: z.string().max(500, "Description too long").optional(),
});

export const createSubscriptionSchema = z.object({
  body: subscriptionBodySchema,
});

export const updateSubscriptionSchema = z.object({
  body: subscriptionBodySchema.partial(),
});

export type CreateSubscriptionInput = z.infer<
  typeof createSubscriptionSchema
>["body"];

export type UpdateSubscriptionInput = z.infer<
  typeof updateSubscriptionSchema
>["body"];
