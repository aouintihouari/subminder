import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().optional(),
    email: z.email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." }),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match.",
    path: ["passwordConfirm"], // L'erreur s'affichera sous ce champ
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
