import { z } from "zod";

export const maririSchema = z.object({
  id: z.string().optional(),
  pesoKg: z.string().min(1, "Peso é obrigatório"),
  unidades: z.string().min(1, "Unidades é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  tipoPlantacao: z.string().min(1, "Tipo de plantação é obrigatório"),
  origemMensagem: z.string().min(1, "Origem é obrigatória"),
});

export const chacronaSchema = z.object({
  id: z.string().optional(),
  pesoKg: z.string().min(1, "Peso é obrigatório"),
  unidades: z.string().min(1, "Unidades é obrigatório"),
  tipoPlantacao: z.string().min(1, "Tipo de plantação é obrigatório"),
  origemMensagem: z.string().min(1, "Origem é obrigatória"),
});

export const lenhaSchema = z.object({
  id: z.string().optional(),
  quantidadeM2: z.string().min(1, "Quantidade é obrigatória"),
  tempoFornalhaAcesa: z.string().min(1, "Tempo é obrigatório"),
  tipoLenha: z.string().min(1, "Tipo de lenha é obrigatório"),
  tipoFornalha: z.string().min(1, "Tipo de fornalha é obrigatório"),
});

export const preparoInfoSchema = z.object({
  id: z.string().optional(),
  inicio: z.date(),
  fim: z.date(),
  producaoLitros: z.string().min(1, "Produção é obrigatória"),
  nucleoId: z.string().min(1, "Núcleo é obrigatório"),
});

export type MaririData = z.infer<typeof maririSchema>;
export type ChacronaData = z.infer<typeof chacronaSchema>;
export type LenhaData = z.infer<typeof lenhaSchema>;
export type PreparoInfoData = z.infer<typeof preparoInfoSchema>;

export interface PreparoFormData {
  mariri: MaririData;
  chacrona: ChacronaData;
  lenha: LenhaData;
  preparoInfo: PreparoInfoData;
}

export interface AlertConfig {
  type: "success" | "error" | "warning";
  title: string;
  message: string;
  onConfirm: (() => void | Promise<void>) | null;
  showCancel: boolean;
}
