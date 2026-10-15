import { GetAllPreparos200Item } from "@/src/http/generated/api.schemas";
import { formatFloat } from "@/src/utils/format-float";

export default function useChacronaHook({
  preparosData,
  totalVegetalPreparado,
}: {
  preparosData: GetAllPreparos200Item[] | undefined;

  totalVegetalPreparado: number;
}) {
  const totalChacrona = (preparosData ?? []).reduce(
    (sum, p) => sum + formatFloat(p.chacrona?.pesoKg ?? "0"),
    0
  );
  const totalPesChacrona = (preparosData ?? []).reduce(
    (sum, p) => sum + formatFloat(p.chacrona?.unidades ?? "0"),
    0
  );
  const pesoMedioChacrona = totalChacrona / (totalPesChacrona || 1);
  const chacronaPorVegetal = totalChacrona / (totalVegetalPreparado || 1);

  return {
    totalChacrona,
    totalPesChacrona,
    pesoMedioChacrona,
    chacronaPorVegetal,
  };
}
