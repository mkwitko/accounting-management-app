import useResultadosSheets from "@/src/components/google-sheets/hooks/use-resultados-sheets";
import { useViewContext } from "@/src/context/view-context";
import useGetSheetName from "@/src/hooks/get-sheet-name";
import {
  FindMe201,
  GetAllPreparos200Item,
  GetSessao200Item,
  PostSessaoCreateBody,
  PutSessaoUpdateBody,
} from "@/src/http/generated/api.schemas";
import { useCheckAuthStatus } from "@/src/http/generated/auth/auth";
import { useGetAllPreparos } from "@/src/http/generated/preparos/preparos";
import {
  useAddDataToSheet,
  useCreateOrUpdateMultiSheet,
} from "@/src/http/generated/sheets/sheets";
import { useGetVegetal } from "@/src/http/generated/vegetal/vegetal";
import { format } from "date-fns";
import { formatVegetaisConsumidos } from "../format-vegetais";
import { sessaoOptions } from "../sessao-types";

export default function useAddSessaoToSheet() {
  const { generalView, regionView, nucleoView, configs } = useViewContext();
  const { mutateAsync: addDataToSheet } = useAddDataToSheet();
  const { mutateAsync: createSheet } = useCreateOrUpdateMultiSheet();
  const { handleGetResultadosData } = useResultadosSheets(configs);
  const { data: preparos } = useGetAllPreparos({
    generalView,
    regionView,
    nucleoView,
  });

  const { data: authStatus } = useCheckAuthStatus();
  const { data: vegetais } = useGetVegetal({
    generalView,
    regionView,
    nucleoView,
  });
    const { getSheetName } = useGetSheetName()

  const addSessaoToSheet = async (
    payload: PutSessaoUpdateBody | PostSessaoCreateBody,
    sessao: GetSessao200Item[],
    user: FindMe201
  ) => {
    if (authStatus?.authenticated === false) {
      return;
    }
    const nomePorId = new Map(
      (vegetais ?? []).map((v) => [v.id, v.nome] as const)
    );
    const vegetaisDetalhe = formatVegetaisConsumidos(
      (payload.vegetais ?? []).map((v) => ({
        nome: nomePorId.get(v.vegetalId),
        local: v.local,
        quantidade: v.quantidade,
      }))
    );

    const sessaoValues = [
      format(new Date(payload.data as string), "dd/MM/yyyy"),
      sessaoOptions.find((opt) => opt.value === payload.sessao)?.name ||
        payload.sessao,
      payload.pessoas,
      `${payload.quantidadeVegetal} Litros`,
      Math.round(
        (Number(payload.quantidadeVegetal) / Number(payload.pessoas)) * 1000
      ) + " ml",
      vegetaisDetalhe,
    ];

    await addDataToSheet({
      data: {
        spreadsheetTitle: getSheetName(),
        sheetName: "Sessões",
        values: [sessaoValues],
        insertAtTop: true,
      },
    });

    const resultadosResponse = handleGetResultadosData({
      preparos: preparos as GetAllPreparos200Item[],
      sessoes: sessao || [],
      user: user as FindMe201,
    });

    await createSheet({
      data: {
        title: getSheetName(),
        resultados: resultadosResponse.data,
        resultadosMerges: resultadosResponse.merges,
        resultadosFormatting: resultadosResponse.getFormattingRequests(0),
      },
    });
  };

  return {
    addSessaoToSheet,
  };
}
