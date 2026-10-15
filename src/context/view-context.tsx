import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFindMe } from "../http/generated/user/user";
import { Configs, defaultConfigs } from "../data/default-configs";
interface ViewContextProps {
  generalView: string;
  setGeneralView: (value: string) => void;
  regionView: string;
  setRegionView: (value: string) => void;
  nucleoView: string;
  setNucleoView: (value: string) => void;
  // Nome da região/núcleo escolhido — para exibir qual está ativo.
  viewLabel: string;
  setViewLabel: (value: string) => void;
  // Núcleo que o usuário frequenta — é a visão base (padrão).
  homeNucleoId: string;
  homeNucleoNome: string;
  isEnchanced: boolean;
  resetViews: () => void;
  configs: Configs;
  setConfigs: (value: Configs) => void;
}

export const ViewContext = createContext<ViewContextProps>(
  {} as ViewContextProps
);

export const ViewContextProvider = ({ children }: { children: ReactNode }) => {
  const [configs, setConfigs] = useState({ ...defaultConfigs });
  const [generalView, setGeneralView] = useState("");
  const [regionView, setRegionView] = useState("");
  const [nucleoView, setNucleoView] = useState("");
  const [viewLabel, setViewLabel] = useState("");

  const { data: user } = useFindMe();
  const homeNucleoId = user?.nucleo?.id ?? "";
  const homeNucleoNome = user?.nucleo?.nome ?? "";

  // Ancora a visão base no núcleo do usuário assim que ele carrega.
  // Só uma vez — não sobrescreve uma visão já escolhida pelo usuário.
  const initedRef = useRef(false);
  useEffect(() => {
    if (!initedRef.current && homeNucleoId) {
      initedRef.current = true;
      if (!generalView && !regionView && !nucleoView) {
        setNucleoView(homeNucleoId);
      }
    }
  }, [homeNucleoId, generalView, regionView, nucleoView]);

  // Voltar à padrão = voltar ao núcleo que frequenta.
  const resetViews = () => {
    setGeneralView("");
    setRegionView("");
    setNucleoView(homeNucleoId);
    setViewLabel("");
  };

  // "Enhanced" = olhando algo fora do núcleo próprio (região/geral/outro núcleo).
  const isEnchanced =
    !!generalView ||
    !!regionView ||
    (!!nucleoView && nucleoView !== homeNucleoId);

  return (
    <ViewContext.Provider
      value={{
        generalView,
        setGeneralView,
        regionView,
        setRegionView,
        nucleoView,
        setNucleoView,
        viewLabel,
        setViewLabel,
        homeNucleoId,
        homeNucleoNome,
        isEnchanced,
        resetViews,
        configs,
        setConfigs,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
};

export const useViewContext = () => useContext(ViewContext);
