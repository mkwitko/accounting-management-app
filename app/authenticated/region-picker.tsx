import { PERMISSIONS_ENUM } from "@/src/@types/permissions";
import HeaderBackButton from "@/src/components/header/header-back-button";
import ScreenHeader from "@/src/components/header/screen-header";

import { useAuthContext } from "@/src/context/auth-context";
import { useViewContext } from "@/src/context/view-context";
import {
  useGetAllNucleos,
  useGetNucleoRegionId,
} from "@/src/http/generated/nucleos/nucleos";
import { useGetAllRegioes } from "@/src/http/generated/regioes/regioes";
import EmptyState from "@/src/pages/region-selector/empty-state";
import LoadingState from "@/src/pages/region-selector/loading-state";
import NucleoListItem from "@/src/pages/region-selector/nucleo-list-item";
import RegionListItem from "@/src/pages/region-selector/region-list-item";
import SearchBar from "@/src/pages/region-selector/search-bar";
import StatsCard from "@/src/pages/region-selector/stats-card";
import ViewOptionCard from "@/src/pages/region-selector/view-option-card";
import { COLORS } from "@/src/styles/colors";
import { useNavigation, useRouter } from "expo-router";
import { Building2, Globe, MapPin } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

type ViewType = "all" | "region" | "nucleo" | null;

export default function RegionSelector() {
  const router = useRouter();
  const [selectedView, setSelectedView] = useState<ViewType>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigation();

  const { userHasRole } = useAuthContext();
  const { setGeneralView, setNucleoView, setRegionView, setViewLabel } =
    useViewContext();

  // Fetch data
  const { data: regioes, isLoading: isLoadingRegioes } = useGetAllRegioes();
  const { data: allNucleos, isLoading: isLoadingAllNucleos } =
    useGetAllNucleos();
  const { data: nucleosRegiao, isLoading: isLoadingNucleosRegiao } =
    useGetNucleoRegionId(selectedRegion as string, {
      query: {
        enabled: !!selectedRegion && selectedView === "nucleo",
      },
    });

  // Navigation handlers
  const handleBack = () => {
    if (selectedView === "nucleo" && selectedRegion) {
      setSelectedRegion(null);
      setSelectedView("region");
      setSearchQuery("");
    } else if (selectedView) {
      setSelectedView(null);
      setSelectedRegion(null);
      setSearchQuery("");
    } else {
      if (navigate.canGoBack()) {
        navigate.goBack();
        return;
      }

      router.replace("/authenticated/(tabs)");
    }
  };

  const handleViewAll = () => {
    setRegionView("");
    setGeneralView("true");
    setNucleoView("");
    setViewLabel("");
    router.replace("/authenticated/(tabs)");
  };

  const handleSelectRegion = (regionId: string) => {
    const regiao = regioes?.find((r) => r.id === regionId);
    setRegionView(regionId);
    setGeneralView("");
    setNucleoView("");
    setViewLabel(regiao?.nome ?? "");
    router.replace("/authenticated/(tabs)");
  };

  const handleSelectNucleoView = () => {
    setSelectedView("nucleo");
    setSearchQuery("");
  };

  const handleSelectRegionForNucleo = (regionId: string) => {
    setSelectedRegion(regionId);
    setSearchQuery("");
  };

  const handleSelectNucleo = (nucleoId: string) => {
    const nucleo = filteredNucleos.find((n) => n.id === nucleoId);
    setRegionView("");
    setGeneralView("");
    setNucleoView(nucleoId);
    setViewLabel(nucleo?.nome ?? "");
    router.replace("/authenticated/(tabs)");
  };

  // Computed values
  const filteredRegioes = useMemo(() => {
    if (!regioes) return [];

    // Filtrar pelo searchQuery
    let result = regioes;
    if (searchQuery) {
      result = regioes.filter((regiao) =>
        regiao.nome.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Ordenar numericamente pelo número inicial da string
    result.sort((a, b) => {
      const numA = parseInt(a.nome.match(/^\d+/)?.[0] ?? "0", 10);
      const numB = parseInt(b.nome.match(/^\d+/)?.[0] ?? "0", 10);
      return numA - numB;
    });

    return result;
  }, [regioes, searchQuery]);

  const currentRegion = useMemo(() => {
    return regioes?.find((r) => r.id === selectedRegion);
  }, [regioes, selectedRegion]);

  const filteredNucleos = useMemo(() => {
    if (!nucleosRegiao) return [];
    if (!searchQuery) return nucleosRegiao;
    return nucleosRegiao.filter((nucleo) =>
      nucleo.nome.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [nucleosRegiao, searchQuery]);

  const getTotalNucleos = () => allNucleos?.length || 0;
  const getTotalRegioes = () => regioes?.length || 0;

  // Loading states
  const isLoadingInitial = isLoadingRegioes || isLoadingAllNucleos;
  const isLoadingContent =
    isLoadingNucleosRegiao && selectedView === "nucleo" && selectedRegion;

  // Header title logic
  const getHeaderTitle = () => {
    if (selectedView === "nucleo" && selectedRegion) {
      return currentRegion?.nome || "Escolher Núcleo";
    }
    if (selectedView === "nucleo") return "Escolher Região";
    if (selectedView === "region") return "Escolher Região";
    return "Visualizar Dados";
  };

  const getHeaderSubtitle = () => {
    if (selectedView === "nucleo" && selectedRegion) {
      return "Selecione um núcleo";
    }
    if (selectedView === "nucleo" || selectedView === "region") {
      return "Selecione uma região";
    }
    return "Escolha sua visualização";
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        left={<HeaderBackButton label="" onPress={handleBack} />}
        title={getHeaderTitle()}
        subtitle={getHeaderSubtitle()}
      />

      <ScrollView
        className="flex-1 px-5 pt-5"
        contentContainerClassName="pb-8 w-full web:max-w-2xl web:self-center"
        showsVerticalScrollIndicator={false}
      >
        {isLoadingInitial ? (
          <LoadingState message="Carregando dados..." />
        ) : (
          <>
            {/* Initial View Selection */}
            {!selectedView && (
              <View className="gap-4">
                <StatsCard
                  totalNucleos={getTotalNucleos()}
                  totalRegioes={getTotalRegioes()}
                />

                {userHasRole(PERMISSIONS_ENUM.VER_REGIOES) && (
                  <ViewOptionCard
                    icon={<Globe color="#FFFFFF" size={28} strokeWidth={2} />}
                    title="Visualizar Tudo"
                    description="Dados consolidados de todas as regiões"
                    onPress={handleViewAll}
                    iconBackgroundColor={COLORS.primary[600]}
                  />
                )}

                {userHasRole(PERMISSIONS_ENUM.VER_REGIOES) && (
                  <ViewOptionCard
                    icon={<MapPin color="#FFFFFF" size={28} strokeWidth={2} />}
                    title="Por Região"
                    description={`Escolha uma das ${getTotalRegioes()} regiões disponíveis`}
                    onPress={() => setSelectedView("region")}
                    iconBackgroundColor={COLORS.secondary[600]}
                  />
                )}

                {userHasRole([
                  PERMISSIONS_ENUM.VER_NUCLEOS,
                  PERMISSIONS_ENUM.VER_REGIOES,
                ]) && (
                  <ViewOptionCard
                    icon={<Building2 color="#FFFFFF" size={28} strokeWidth={2} />}
                    title="Por Núcleo"
                    description="Selecione um núcleo específico"
                    onPress={handleSelectNucleoView}
                    iconBackgroundColor={COLORS.primary[300]}
                  />
                )}
              </View>
            )}

            {/* Region Selection (Direct Navigation) */}
            {selectedView === "region" && (
              <View>
                <SearchBar
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar região..."
                />

                {filteredRegioes.length === 0 ? (
                  <EmptyState message="Nenhuma região encontrada" />
                ) : (
                  <View className="gap-3">
                    {filteredRegioes.map((regiao) => (
                      <RegionListItem
                        key={regiao.id}
                        nome={regiao.nome}
                        onPress={() => handleSelectRegion(regiao.id)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Region Selection for Nucleo (First Step) */}
            {selectedView === "nucleo" && !selectedRegion && (
              <View>
                <SearchBar
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar região..."
                />

                {filteredRegioes.length === 0 ? (
                  <EmptyState message="Nenhuma região encontrada" />
                ) : (
                  <View className="gap-3">
                    {filteredRegioes.map((regiao) => (
                      <RegionListItem
                        key={regiao.id}
                        nome={regiao.nome}
                        onPress={() => handleSelectRegionForNucleo(regiao.id)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Nucleo Selection (Second Step) */}
            {selectedView === "nucleo" && selectedRegion && (
              <View>
                <SearchBar
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar núcleo..."
                />

                {isLoadingContent ? (
                  <LoadingState message="Carregando núcleos..." />
                ) : filteredNucleos.length === 0 ? (
                  <EmptyState message="Nenhum núcleo encontrado" />
                ) : (
                  <View className="gap-3">
                    {filteredNucleos.map((nucleo) => (
                      <NucleoListItem
                        key={nucleo.id}
                        nome={nucleo.nome}
                        regionName={currentRegion?.nome}
                        onPress={() => handleSelectNucleo(nucleo.id)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
