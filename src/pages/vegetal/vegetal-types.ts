import z from "zod";

export const vegetalFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.enum(["caupuri", "tucunaca", "caupuri_tucunaca"], {
    required_error: "Tipo é obrigatório",
  }),
  dataPreparo: z.date().optional(),
  mestrePreparo: z.string().optional(),
  observacoes: z.string().optional(),
  litrosEstoque: z.string().optional(),
  litrosGeladeira: z.string().optional(),
});

export type VegetalFormData = z.infer<typeof vegetalFormSchema>;

export const tipoVegetalOptions = [
  { value: "caupuri", label: "Caupuri" },
  { value: "tucunaca", label: "Tucunacá" },
  { value: "caupuri_tucunaca", label: "Caupuri e Tucunacá" },
];

export const localVegetalOptions = [
  { value: "estoque", label: "Estoque" },
  { value: "geladeira", label: "Geladeira (saldo)" },
];

export function tipoVegetalLabel(tipo: string) {
  return tipoVegetalOptions.find((o) => o.value === tipo)?.label ?? tipo;
}

export function localVegetalLabel(local: string) {
  return localVegetalOptions.find((o) => o.value === local)?.label ?? local;
}
