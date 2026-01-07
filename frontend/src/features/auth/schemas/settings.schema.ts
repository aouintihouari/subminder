import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required." }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.passwordConfirm, {
    message: "Passwords do not match.",
    path: ["passwordConfirm"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password.",
    path: ["newPassword"],
  });

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;
