import { useAuthContext } from "../context/auth-context";
import { useViewContext } from "../context/view-context";
import { useGetAllNucleos } from "../http/generated/nucleos/nucleos";
import { useGetAllRegioes } from "../http/generated/regioes/regioes";

export default function useGetSheetName() {
  const { user } = useAuthContext();
  const { generalView, regionView, nucleoView } = useViewContext();
  const { data: regioes } = useGetAllRegioes();
  const { data: nucleos } = useGetAllNucleos();

  const getSheetName = () => {
    if (nucleoView) {
      const nucleo = nucleos?.find((n) => n.id === nucleoView);
      return `Field Data - ${nucleo?.nome}`;
    } else if (regionView) {
      const regiao = regioes?.find((r) => r.id === regionView);
      return `Field Data - ${regiao?.nome}`;
    } else if (generalView) {
      return "Field Data - Geral";
    }

    return `Field Data - ${user?.nucleo?.nome || user?.nome}`;
  };

  return {
    getSheetName,
  }
}
