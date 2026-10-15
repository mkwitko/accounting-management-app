import { GetAllPreparos200Item } from "@/src/http/generated/api.schemas";
import { formatFloat } from "@/src/utils/format-float";

export default function useMaririHook({
  preparosData,
  totalVegetalPreparado,
}: {
  preparosData: GetAllPreparos200Item[] | undefined;
  totalVegetalPreparado: number;
}) {
  const totalMariri = (preparosData ?? []).reduce(
    (sum, p) => sum + formatFloat(p.mariri?.pesoKg ?? "0"),
    0
  );
  const totalPesMariri = (preparosData ?? []).reduce(
    (sum, p) => sum + formatFloat(p.mariri?.unidades ?? "0"),
    0
  );
  const pesoMedioMariri = totalMariri / (totalPesMariri || 1);
  const maririPorVegetal = totalMariri / (totalVegetalPreparado || 1);

  return {
    totalMariri,
    totalPesMariri,
    pesoMedioMariri,
    maririPorVegetal,
  };
}
