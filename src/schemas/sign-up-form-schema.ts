import { z } from "zod";

export const signUpFormSchema = z
  .object({
    nome: z.string().min(3, "Informe seu nome completo"),
    email: z.string().refine((val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(val);
    }, "Email inválido"),
    senha: z.string().min(8, "Mínimo 8 caracteres"),
    confirmarSenha: z.string(),
    nucleoId: z.string().min(1, "Escolha seu núcleo"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não conferem",
    path: ["confirmarSenha"],
  });

export type SignUpFormSchema = z.infer<typeof signUpFormSchema>;
