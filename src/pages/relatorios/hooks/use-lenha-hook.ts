import { GetAllPreparos200Item } from "@/src/http/generated/api.schemas";
import { formatFloat } from "@/src/utils/format-float";

export default function useLenhaHook({
  preparosData,
  totalPreparos,
  totalVegetalPreparado,
}: {
  preparosData: GetAllPreparos200Item[] | undefined;
  totalPreparos: number;
  totalVegetalPreparado: number;
}) {
  const totalFornalhaAcesa = (preparosData ?? []).reduce(
    (sum, p) => sum + formatFloat(p.lenha?.tempoFornalhaAcesa ?? "0"),
    0
  );
  const tempoMedioFornalha = totalFornalhaAcesa / (totalPreparos || 1);

  const totalLenha = (preparosData ?? []).reduce(
    (sum, p) => sum + formatFloat(p.lenha?.quantidadeM2 ?? "0"),
    0
  );
  const consumoLenhaPorTempo = totalLenha / (totalFornalhaAcesa || 1);
  const consumoLenhaPorVegetal = totalLenha / (totalVegetalPreparado || 1);

  return {
    totalFornalhaAcesa,
    tempoMedioFornalha,
    totalLenha,
    consumoLenhaPorTempo,
    consumoLenhaPorVegetal,
  };
}
