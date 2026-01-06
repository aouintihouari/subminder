import { z } from "zod";
import { Frequency, Category } from "../types/types";

export const createSubscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  frequency: z.enum(Frequency, { message: "Please select a frequency" }),
  category: z.enum(Category, { message: "Please select a category" }),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  description: z.string().max(500, "Description is too long").optional(),
});

export type CreateSubscriptionFormValues = z.infer<
  typeof createSubscriptionSchema
>;
