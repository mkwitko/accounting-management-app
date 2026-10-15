import { useViewContext } from "@/src/context/view-context";
import { useGetAllPreparos } from "@/src/http/generated/preparos/preparos";
import { format } from "date-fns";
import { MergeRange } from "../lib/sheets-formatting";
import { createMerge } from "../lib/sheets-utils";

export default function usePreparosSheets() {
  const { generalView, regionView, nucleoView } = useViewContext();
  const { data: preparos } = useGetAllPreparos({
    generalView,
    regionView,
    nucleoView,
  })

  const handleGetPreparosData = (preparoId?: string) => {
    // Linha 1: Headers principais com merges
    const headerMaster = [
      "Preparo",
      "",
      "Mariri",
      "",
      "",
      "",
      "",
      "Chacrona",
      "",
      "",
      "",
      "Lenha",
      "",
      "",
      "",
      "Vegetal",
    ]

    // Linha 2: Sub-headers
    const headerSub = [
      "Data",
      "",
      "Peso",
      "No de plantas",
      "Plantio",
      "Tipo",
      "Local de origem",
      "Peso",
      "No de plantas",
      "Plantio",
      "Local de origem",
      "Quantidade",
      "Tempo de preparo",
      "Tipo de lenha",
      "Tipo de Fornalha",
      "Produção",
    ]

    // Linha 3: Detalhes dos headers
    const headerSubSub = [
      "Início",
      "Término",
      "(Kg)",
      "(und.)",
      "Plantado/Nativo",
      "(caupuri-tucunacá)",
      "(mensagem)",
      "(Kg)",
      "(und.)",
      "Plantado/Nativo",
      "(mensagem)",
      "(m3)",
      "(h)",
      "(tipo)",
      "(tipo)",
      "(L)",
    ]

    // Dados
    const data =
      preparos?.filter((preparo) => {
        if (preparoId) {
          return preparo.id === preparoId
        }
        return true
      }).map((preparo) => [
        format(new Date(preparo.inicio), "dd/MM/yyyy"),
        format(new Date(preparo.fim), "dd/MM/yyyy"),
        preparo.mariri?.pesoKg?.toString(),
        preparo.mariri?.unidades.toString(),
        preparo.mariri?.origemMensagem,
        preparo.mariri?.tipo,
        preparo.mariri?.origemMensagem,
        preparo.chacrona?.pesoKg.toString(),
        preparo.chacrona?.unidades.toString(),
        preparo.chacrona?.tipoPlantacao,
        preparo.chacrona?.origemMensagem,
        preparo.lenha?.quantidadeM2.toString(),
        preparo.lenha?.tempoFornalhaAcesa.toString(),
        preparo.lenha?.tipoLenha,
        preparo.lenha?.tipoFornalha,
        preparo.producaoLitros.toString(),
      ]) || []

    // Montar matriz final
    const finalData = [headerMaster, headerSub, headerSubSub, ...data]

    const merges: MergeRange[] = [
      // Linha 1 (headerMaster)
      createMerge(0, 0, 0, 1), // "Preparo"
      createMerge(0, 0, 2, 6), // "Mariri"
      createMerge(0, 0, 7, 10), // "Chacrona"
      createMerge(0, 0, 11, 14), // "Lenha"
      createMerge(0, 0, 15, 15), // "Vegetal"

      // Linha 2 (headerSub)
      createMerge(1, 1, 0, 1), // "Data"
    ]

    return { data: finalData, merges }
  }

  return {
    handleGetPreparosData,
  }
}
