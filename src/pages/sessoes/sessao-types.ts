import z from "zod"

export const consumoVegetalSchema = z.object({
  // Opcional: sem vegetal, só conta no total e não desconta do estoque.
  vegetalId: z.string().optional().default(""),
  local: z.enum(["estoque", "geladeira"]),
  // Litros consumidos na sessão.
  quantidade: z.string().min(1, "Informe a quantidade"),
  // Litros filtrados (retirados do estoque). Opcional; sem vegetal não se aplica.
  filtrado: z.string().optional().default(""),
})

export type ConsumoVegetal = z.infer<typeof consumoVegetalSchema>

export const sessaoFormSchema = z
  .object({
    sessao: z.string().min(1, "Tipo de sessão é obrigatório"),
    pessoas: z.string().min(1, "Número de pessoas é obrigatório"),
    // Total. Opcional quando há vegetais detalhados (calculado a partir deles).
    quantidadeVegetal: z.string().optional(),
    descricao: z.string().optional(),
    data: z.date(),
    nucleoId: z.string().min(1, "Núcleo é obrigatório"),
    vegetais: z.array(consumoVegetalSchema).optional(),
  })
  .refine(
    (d) => (d.vegetais && d.vegetais.length > 0) || !!d.quantidadeVegetal,
    {
      message: "Informe a quantidade ou adicione ao menos um Vegetal",
      path: ["quantidadeVegetal"],
    }
  )

export type SessaoFormData = z.infer<typeof sessaoFormSchema>


export interface AlertConfig {
  type: "success" | "error" | "warning"
  title: string
  message: string
  onConfirm: (() => void) | null
  showCancel: boolean
  confirmText?: string
  cancelText?: string
  onCancel?: (() => void) | null
}

export const sessaoOptions = [
  { value: "escala", label: "Escala", name: "Sessão de Escala" },
  { value: "escala_anual", label: "Escala Anual", name: "Sessão de Escala Anual" },
  { value: "sessao_instrutiva", label: "Sessão Instrutiva", name: "Sessão Instrutiva" },
  { value: "carater_instrutivo", label: "Caráter Instrutivo", name: "Sessão de Caráter Instrutivo" },
  { value: "direcao", label: "Direção", name: "Sessão da Direção" },
  { value: "qm", label: "QM", name: "Sessão do QM" },
  { value: "preparo", label: "Preparo", name: "Sessão de Preparo" },
  { value: "jovens", label: "Sessão de Jovens", name: "Sessão de Jovens" },
  { value: "pais", label: "Sessão de Pais", name: "Sessão de Pais" },
  { value: "casal", label: "Sessão de Casal", name: "Sessão de Casal" },
  { value: "extra", label: "Sessão de Extra", name: "Sessão Extra" },
  { value: "adventicio", label: "Sessão de Adventício", name: "Sessão de Adventício" },
]
