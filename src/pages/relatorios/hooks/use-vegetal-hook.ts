import { GetSessao200Item } from "@/src/http/generated/api.schemas";
import { formatFloat } from "@/src/utils/format-float";

export default function useVegetalHook({
  sessoesData,
  totalSessoes,
  totalPessoas,
}: {
  sessoesData: GetSessao200Item[] | undefined;
  totalSessoes: number;
  totalPessoas: number;
}) {
  // Pegar media de vegetal consumido por sessão
  const totalVegetalConsumido = (sessoesData ?? []).reduce(
    (sum, s) => sum + formatFloat(s.quantidadeVegetal ?? 0),
    0
  );

  const mediaVegetalPorSessao = totalVegetalConsumido / (totalSessoes || 1);

  const mediaVegetalPorPessoa = Math.round(
    (totalVegetalConsumido / (totalPessoas || 1)) * 1000
  );

  return {
    totalVegetalConsumido,
    mediaVegetalPorSessao,
    mediaVegetalPorPessoa,
  };
}
