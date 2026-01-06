import { z } from "zod";
import { Category, Frequency } from "../types/types";

export const subscriptionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  currency: z.enum(["EUR", "USD", "GBP"]),
  frequency: z.nativeEnum(Frequency),
  category: z.nativeEnum(Category),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  description: z.string().optional(),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
