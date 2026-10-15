import useResultadosSheets from "@/src/components/google-sheets/hooks/use-resultados-sheets";
import { useAuthContext } from "@/src/context/auth-context";
import { useViewContext } from "@/src/context/view-context";
import useGetSheetName from "@/src/hooks/get-sheet-name";
import {
  FindMe201,
  GetAllPreparos200Item,
} from "@/src/http/generated/api.schemas";
import { useCheckAuthStatus } from "@/src/http/generated/auth/auth";
import { useGetSessao } from "@/src/http/generated/sessoes/sessoes";
import {
  useAddDataToSheet,
  useCreateOrUpdateMultiSheet,
} from "@/src/http/generated/sheets/sheets";
import { format } from "date-fns";
import { PreparoFormData } from "../schema/preparo-schema";

export default function useAddPreparoSheet() {
  const { generalView, regionView, nucleoView, configs } = useViewContext();
  const { user } = useAuthContext();
  const { data: sessoes } = useGetSessao({
    generalView,
    regionView,
    nucleoView,
  });
  const { mutateAsync: addDataToSheet } = useAddDataToSheet();
  const { mutateAsync: createSheet } = useCreateOrUpdateMultiSheet();
    const { getSheetName } = useGetSheetName()

  const { handleGetResultadosData } = useResultadosSheets(configs);
  const { data: authStatus } = useCheckAuthStatus();

  const addPreparoSheet = (
    payload: PreparoFormData,
    updatedPreparos: GetAllPreparos200Item[]
  ) => {
    if (authStatus?.authenticated === false) {
      return;
    }
    const preparoData = [
      [
        format(
          new Date(payload.preparoInfo.inicio.toISOString()),
          "dd/MM/yyyy"
        ),
        format(new Date(payload.preparoInfo.fim.toISOString()), "dd/MM/yyyy"),
        payload.mariri?.pesoKg?.toString(),
        payload.mariri?.unidades.toString(),
        payload.mariri?.origemMensagem,
        payload.mariri?.tipo,
        payload.mariri?.origemMensagem,
        payload.chacrona?.pesoKg.toString(),
        payload.chacrona?.unidades.toString(),
        payload.chacrona?.tipoPlantacao,
        payload.chacrona?.origemMensagem,
        payload.lenha?.quantidadeM2.toString(),
        payload.lenha?.tempoFornalhaAcesa.toString(),
        payload.lenha?.tipoLenha,
        payload.lenha?.tipoFornalha,
        payload.preparoInfo.producaoLitros.toString(),
      ],
    ];

    addDataToSheet({
      data: {
        spreadsheetTitle: getSheetName(),
        sheetName: "Preparos",
        values: preparoData,
        insertAtTop: true,
        skipRows: 3,
      },
    });

    const resultadosResponse = handleGetResultadosData({
      preparos: updatedPreparos as GetAllPreparos200Item[],
      sessoes: sessoes || [],
      user: user as FindMe201,
    });

    createSheet({
      data: {
        title: getSheetName(),
        resultados: resultadosResponse.data,
        resultadosMerges: resultadosResponse.merges,
        resultadosFormatting: resultadosResponse.getFormattingRequests(0),
      },
    });
  };

  return {
    addPreparoSheet,
  };
}
