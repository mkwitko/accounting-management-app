import useResultadosSheets from "@/src/components/google-sheets/hooks/use-resultados-sheets";
import { useAuthContext } from "@/src/context/auth-context";
import { useViewContext } from "@/src/context/view-context";
import useGetSheetName from "@/src/hooks/get-sheet-name";
import {
  FindMe201,
  GetAllPreparos200Item,
  GetSessao200Item,
} from "@/src/http/generated/api.schemas";
import { useCheckAuthStatus } from "@/src/http/generated/auth/auth";
import { useGetAllPreparos } from "@/src/http/generated/preparos/preparos";
import {
  useCreateOrUpdateMultiSheet,
  useDeleteRowByValue,
} from "@/src/http/generated/sheets/sheets";
import { format } from "date-fns";

export default function useRemoveSessaoFromSheet() {
  const { generalView, regionView, nucleoView, configs } = useViewContext();
  const { mutateAsync: deleteRowByValue } = useDeleteRowByValue();
  const { mutateAsync: createSheet } = useCreateOrUpdateMultiSheet();

  const { handleGetResultadosData } = useResultadosSheets(configs);
  const { data: preparos } = useGetAllPreparos({
    generalView,
    regionView,
    nucleoView,
  });

  const { user } = useAuthContext();
  const { data: authStatus } = useCheckAuthStatus();
  const { getSheetName } = useGetSheetName()

  const removeSessaoFromSheet = async (
    sessao: GetSessao200Item,
    newSessoes: GetSessao200Item[]
  ) => {
    if (authStatus?.authenticated === false) {
      return;
    }
    try {
      await deleteRowByValue({
        data: {
          spreadsheetTitle: getSheetName(),
          sheetName: "Sessões",
          matchValue: format(sessao.data, "dd/MM/yyyy"),
        },
      });

      const resultadosResponse = handleGetResultadosData({
        preparos: preparos as GetAllPreparos200Item[],
        sessoes: newSessoes || [],
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
    removeSessaoFromSheet,
  };
}
