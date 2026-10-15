import { GetSessao200Item } from '@/src/http/generated/api.schemas';

export default function usePessoasHook({sessoesData, totalSessoes}: {
  sessoesData: GetSessao200Item[] | undefined
  totalSessoes: number
}) {
  const totalPessoas = (sessoesData ?? []).reduce(
    (sum, s) => sum + Number(s.pessoas ?? 0),
    0
  );

  const mediaPessoasPorSessao = Math.round(totalPessoas / (totalSessoes || 1));

  return {
    totalPessoas,
    mediaPessoasPorSessao
  }
}
