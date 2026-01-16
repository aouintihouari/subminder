import { z } from "zod";

import { CategoryType } from "@prisma/client";

const categoryBodySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  icon: z.string().min(1, "Icon identifier is required"),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid Hex Color"),
  type: z.enum(CategoryType),
  isDigital: z.boolean().optional().default(false),
});

export const createCategorySchema = z.object({
  body: categoryBodySchema,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
