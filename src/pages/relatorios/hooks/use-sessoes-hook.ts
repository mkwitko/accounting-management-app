import { GetSessao200Item } from "@/src/http/generated/api.schemas";
import { differenceInDays } from "date-fns";

export default function useSessoesHook({
  sessoesData,
}: {
  sessoesData: GetSessao200Item[] | undefined;
}) {
  const primeiraSessao =
    sessoesData && sessoesData.length > 0
      ? new Date(sessoesData[0].data)
      : new Date();
  const derradeiraSessao =
    sessoesData && sessoesData.length > 0
      ? new Date(sessoesData[sessoesData.length - 1].data)
      : new Date();
  const diferencaDias =
    Math.abs(differenceInDays(primeiraSessao, derradeiraSessao)) || 1;

  // Número total de sessões cadastradas
  const totalSessoes = sessoesData?.length ?? 0;

  const mediaSessoesAno = Math.round((totalSessoes / diferencaDias) * 365);

  console.log({
    primeiraSessao,
    derradeiraSessao,
    diferencaDias,
    totalSessoes,
  });

  return {
    totalSessoes,
    diferencaDias,
    mediaSessoesAno,
  };
}
