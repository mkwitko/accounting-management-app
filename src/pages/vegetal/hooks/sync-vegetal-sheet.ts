import {
  COMMON_FORMATS,
  createDimensionRequest,
  createFormatRequest,
} from "@/src/components/google-sheets/lib/sheets-formatting";
import { useViewContext } from "@/src/context/view-context";
import useGetSheetName from "@/src/hooks/get-sheet-name";
import type { GetVegetal200Item } from "@/src/http/generated/api.schemas";
import { useCheckAuthStatus } from "@/src/http/generated/auth/auth";
import { useCreateOrUpdateMultiSheet } from "@/src/http/generated/sheets/sheets";
import { useGetVegetal } from "@/src/http/generated/vegetal/vegetal";
import { tipoVegetalLabel } from "@/src/pages/vegetal/vegetal-types";
import { formatFloat } from "@/src/utils/format-float";
import { format } from "date-fns";

const HEADERS = [
  "Nome",
  "Tipo",
  "Data do Preparo",
  "Mestre do Preparo",
  "Estoque (L)",
  "Geladeira (L)",
  "Total (L)",
  "Observações",
];

function safeDate(value: string) {
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : format(d, "dd/MM/yyyy");
}

/**
 * Reescreve a aba "Estoque de Vegetal" da planilha com os saldos atuais.
 * Chamar após qualquer mutação que altere estoque (CRUD de vegetal ou sessão).
 */
export default function useSyncVegetalSheet() {
  const { generalView, regionView, nucleoView } = useViewContext();
  const { data: vegetaisData, refetch } = useGetVegetal({
    generalView,
    regionView,
    nucleoView,
  });
  const { mutateAsync: createSheet } = useCreateOrUpdateMultiSheet();
  const { data: authStatus } = useCheckAuthStatus();
  const { getSheetName } = useGetSheetName();

  const syncVegetalSheet = async (override?: GetVegetal200Item[]) => {
    if (authStatus?.authenticated === false) return;

    // Busca saldo mais recente (cache fica velho logo após a mutação).
    let vegetais = override ?? vegetaisData ?? [];
    if (!override) {
      try {
        const fresh = await refetch();
        if (fresh.data) vegetais = fresh.data;
      } catch {
        // usa cache se refetch falhar
      }
    }

    const rows = vegetais.map((v) => {
      const total = formatFloat(v.litrosEstoque) + formatFloat(v.litrosGeladeira);
      return [
        v.nome,
        tipoVegetalLabel(v.tipo),
        safeDate(v.dataPreparo),
        v.mestrePreparo,
        `${v.litrosEstoque}`,
        `${v.litrosGeladeira}`,
        total.toFixed(2),
        v.observacoes || "",
      ];
    });

    const values = [HEADERS, ...rows];

    // Formatação leve: cabeçalho + largura das colunas.
    const vegetalFormatting = [
      createFormatRequest(0, 0, 1, 0, HEADERS.length, COMMON_FORMATS.sectionHeader),
      createDimensionRequest(0, "COLUMNS", 0, HEADERS.length, 180),
    ];

    await createSheet({
      data: {
        title: getSheetName(),
        vegetal: values,
        vegetalFormatting,
      },
    });
  };

  return { syncVegetalSheet };
}
