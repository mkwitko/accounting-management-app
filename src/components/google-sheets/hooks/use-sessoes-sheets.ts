import { useViewContext } from "@/src/context/view-context";
import { useGetSessao } from "@/src/http/generated/sessoes/sessoes";
import { formatVegetaisConsumidos } from "@/src/pages/sessoes/format-vegetais";
import { sessaoOptions } from "@/src/pages/sessoes/sessao-types";
import { format } from "date-fns";

export default function useSessoesSheets() {
  const { generalView, regionView, nucleoView } = useViewContext();
  const { data: sessoes } = useGetSessao({
    generalView,
    regionView,
    nucleoView,
  });
  const handleGetSessoesData = () => {
    const sessoesHeaders = [
      "Data",
      "Grau da Sessão",
      "Nº Pessoas",
      "Vegetal (L)",
      "Vegetal/pessoa (L)",
      "Vegetal (detalhe)",
    ];
    const sessoesData = sessoes?.map((sessao) => {
      return [
        format(new Date(sessao.data), "dd/MM/yyyy"),
        sessaoOptions.find((opt) => opt.value === sessao.sessao)?.name ||
          sessao.sessao,
        sessao.pessoas,
        `${sessao.quantidadeVegetal} Litros`,
        Math.round(
          (Number(sessao.quantidadeVegetal) / Number(sessao.pessoas)) * 1000
        ) + " ml",
        formatVegetaisConsumidos(
          (sessao.vegetais ?? []).map((v) => ({
            nome: v.vegetal?.nome,
            local: v.local,
            quantidade: v.quantidade,
          }))
        ),
      ];
    });
    return { sessoesHeaders, sessoesData };
  };

  return {
    handleGetSessoesData,
  };
}
