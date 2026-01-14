import { z } from "zod";
import { CURRENCIES } from "@/config/currencies";

export const createSubscriptionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  currency: z.enum(CURRENCIES).default("EUR"),
  frequency: z.enum(["WEEKLY", "MONTHLY", "YEARLY", "ONCE"]),
  category: z.enum([
    "ENTERTAINMENT",
    "LEARNING",
    "UTILITIES",
    "WORK",
    "HEALTH",
    "FOOD",
    "OTHER",
  ]),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date",
  }),
  description: z.string().optional(),
});

export type SubscriptionFormData = z.infer<typeof createSubscriptionSchema>;
