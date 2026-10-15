import { GetAllPreparos200Item } from "@/src/http/generated/api.schemas";
import { formatFloat } from "@/src/utils/format-float";

export default function usePreparoHook({
  preparosData,
}: {
  preparosData: GetAllPreparos200Item[] | undefined;
}) {
  const totalPreparos = preparosData?.length ?? 0;

  const totalVegetalPreparado = (preparosData ?? []).reduce(
    (sum, p) => sum + formatFloat(p.producaoLitros ?? 0),
    0
  );
  const mediaLitrosPreparados = totalVegetalPreparado / (totalPreparos || 1);

  return {
    totalPreparos,
    totalVegetalPreparado,
    mediaLitrosPreparados,
  };
}
