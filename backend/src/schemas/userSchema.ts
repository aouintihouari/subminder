import { z } from "zod";

export const updateMeSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, { message: "Name cannot be empty" })
      .max(100, { message: "Name is too long" })
      .optional(),
    preferredCurrency: z.string().length(3).optional(),
  }),
});

export const updatePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string()
        .min(1, { message: "Current password is required" }),
      newPassword: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" }),
      passwordConfirm: z.string(),
    })
    .refine((data) => data.newPassword === data.passwordConfirm, {
      message: "New passwords do not match",
      path: ["passwordConfirm"],
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
      message: "New password must be different from the current password",
      path: ["newPassword"],
    }),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>["body"];
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>["body"];
