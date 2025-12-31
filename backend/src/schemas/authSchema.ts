import { z } from "zod";

export const signupSchema = z.object({
  body: z
    .object({
      email: z.email({ message: "Invalid email address" }),
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" }),
      passwordConfirm: z.string(),
      name: z.string().optional(),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: "Passwords do not match",
      path: ["passwordConfirm"],
    }),
});
