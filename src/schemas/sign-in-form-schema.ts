import { z } from "zod";

export const signInFormSchema = z.object({
  email: z.string().refine((val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val);
  }),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type SignInFormSchema = z.infer<typeof signInFormSchema>;
