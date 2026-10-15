import { localVegetalLabel } from "@/src/pages/vegetal/vegetal-types";

interface ConsumoLike {
  nome?: string | null;
  local: string;
  quantidade: string;
}

/**
 * Texto legível dos vegetais consumidos, p/ coluna da aba Sessões.
 * Ex: "Caupuri Março (Estoque): 3,00 L; Tucunacá (Geladeira): 2,00 L"
 */
export function formatVegetaisConsumidos(items: ConsumoLike[] | undefined): string {
  if (!items?.length) return "-";
  return items
    .filter((v) => v.quantidade)
    .map((v) => {
      const nome = v.nome || "Vegetal";
      return `${nome} (${localVegetalLabel(v.local)}): ${v.quantidade} L`;
    })
    .join("; ");
}
