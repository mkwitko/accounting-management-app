import { z } from "zod";

export const statusFormSchema = z.object({
  status: z
    .string()
    .min(1, "O status é obrigatório")
    .max(255, "O status é muito longo"),
  subStatus: z.string().optional(),
});

export type StatusFormSchema = z.infer<typeof statusFormSchema>;
