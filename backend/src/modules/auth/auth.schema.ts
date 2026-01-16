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

export const loginSchema = z.object({
  body: z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email({ message: "Invalid email address" }),
  }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" }),
      passwordConfirm: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: "Passwords do not match",
      path: ["passwordConfirm"],
    }),
});

export type LoginInput = z.infer<typeof loginSchema>["body"];
