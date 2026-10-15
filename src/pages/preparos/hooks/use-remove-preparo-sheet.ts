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
  useCreateOrUpdateMultiSheet,
  useDeleteRowByValue,
} from "@/src/http/generated/sheets/sheets";
import { format } from "date-fns";

export default function useRemovePreparoSheet() {
  const { generalView, regionView, nucleoView, configs } = useViewContext();
  const { user } = useAuthContext();

  const { mutateAsync: createSheet } = useCreateOrUpdateMultiSheet();
  const { data: sessoes } = useGetSessao({
    generalView,
    regionView,
    nucleoView,
  });

  const { mutateAsync: deleteRowByValue } = useDeleteRowByValue();
  const { getSheetName } = useGetSheetName();

  const { handleGetResultadosData } = useResultadosSheets(configs);
  const { data: authStatus } = useCheckAuthStatus();

  const removePreparoSheet = async (
    preparo: GetAllPreparos200Item,
    updatedPreparos: GetAllPreparos200Item[]
  ) => {
    if (authStatus?.authenticated === false) {
      return;
    }
    try {
      await deleteRowByValue({
        data: {
          spreadsheetTitle: getSheetName(),
          sheetName: "Preparos",
          matchValue: format(preparo.inicio, "dd/MM/yyyy"),
        },
      });
      const resultadosResponse = handleGetResultadosData({
        preparos: updatedPreparos as GetAllPreparos200Item[],
        sessoes: sessoes || [],
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
    } catch {}
  };

  return {
    removePreparoSheet,
  };
}
