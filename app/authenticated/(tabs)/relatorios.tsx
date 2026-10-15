import EmptyRelatorios from "@/src/components/empty-relatorios";
import DrawerMenuButton from "@/src/components/header/drawer-menu-button";
import ScreenHeader from "@/src/components/header/screen-header";
import ConfigurationModal from "@/src/components/reports/configuration-modal";
import { ViewBadge } from "@/src/components/view-badge";
import { useViewContext } from "@/src/context/view-context";
import { useGetAllPreparos } from "@/src/http/generated/preparos/preparos";
import { useGetSessao } from "@/src/http/generated/sessoes/sessoes";
import { ExpandableSection } from "@/src/pages/relatorios/expandable-section";
import useChacronaHook from "@/src/pages/relatorios/hooks/use-chacrona-hook";
import useLenhaHook from "@/src/pages/relatorios/hooks/use-lenha-hook";
import useMaririHook from "@/src/pages/relatorios/hooks/use-mariri-hook";
import usePessoasHook from "@/src/pages/relatorios/hooks/use-pessoas-hook";
import usePreparoHook from "@/src/pages/relatorios/hooks/use-preparo-hook";
import useSessoesHook from "@/src/pages/relatorios/hooks/use-sessoes-hook";
import useVegetalHook from "@/src/pages/relatorios/hooks/use-vegetal-hook";
import { MetricCard } from "@/src/pages/relatorios/metric-card";
import { COLORS } from "@/src/styles/colors";
import {
  Clock,
  Droplet,
  Flame,
  Info,
  Settings,
  Sprout,
  TreePine,
  TrendingUp,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RelatorioGeral() {
  const { generalView, regionView, nucleoView, configs, setConfigs } =
    useViewContext();

  const [showModalConfigs, setShowModalConfigs] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState<{
    title: string;
    content: string;
    icon: string;
  } | null>(null);

  const { data: preparosData, isLoading: loadingPreparos } = useGetAllPreparos({
    generalView,
    regionView,
    nucleoView,
  });

  const { data: sessoesData, isLoading: loadingSessoes } = useGetSessao({
    generalView,
    regionView,
    nucleoView,
  });

  // ================= CÁLCULOS COM CONFIGS =================
  const METADE_DIAMETRO_TOPO = configs.DIAMETRO_TOPO / 2;
  const METADE_DIAMETRO_BASE = configs.DIAMETRO_BASE / 2;
  const CRESCIMENTO_ANUAL_DECIMAL = 1 + configs.CRESCIMENTO_ANUAL / 100;

  const VOLUME_LENHA_M3 =
    Math.round(
      Math.PI *
        (configs.ALTURA_TRONCO / 3) *
        (METADE_DIAMETRO_BASE ** 2 +
          METADE_DIAMETRO_BASE * METADE_DIAMETRO_TOPO +
          METADE_DIAMETRO_TOPO ** 2) *
        10
    ) / 10;

  const { totalSessoes, mediaSessoesAno } = useSessoesHook({ sessoesData });
  const { totalPessoas, mediaPessoasPorSessao } = usePessoasHook({
    sessoesData,
    totalSessoes,
  });

  const { mediaVegetalPorPessoa } = useVegetalHook({
    sessoesData,
    totalSessoes,
    totalPessoas,
  });

  const { totalPreparos, totalVegetalPreparado, mediaLitrosPreparados } =
    usePreparoHook({ preparosData });

  const { pesoMedioMariri, maririPorVegetal } = useMaririHook({
    preparosData,
    totalVegetalPreparado,
  });

  const { pesoMedioChacrona, chacronaPorVegetal } = useChacronaHook({
    preparosData,
    totalVegetalPreparado,
  });

  const { tempoMedioFornalha, consumoLenhaPorTempo, consumoLenhaPorVegetal } =
    useLenhaHook({ preparosData, totalPreparos, totalVegetalPreparado });

  // Media Vegetal por ano
  const mediaVegetalAno = Math.round(
    (mediaSessoesAno * mediaPessoasPorSessao * mediaVegetalPorPessoa) / 1000
  );

  const plantioMaririPorAno = Math.round(
    (mediaVegetalAno * maririPorVegetal * CRESCIMENTO_ANUAL_DECIMAL) /
      pesoMedioMariri
  );
  const plantioChacronaPorAno = Math.round(
    (mediaVegetalAno * chacronaPorVegetal * CRESCIMENTO_ANUAL_DECIMAL) /
      pesoMedioChacrona
  );
  const plantioLenhaPorAno = Math.round(
    mediaVegetalAno * consumoLenhaPorVegetal * CRESCIMENTO_ANUAL_DECIMAL
  );

  const areaMariri = Math.round(
    plantioMaririPorAno *
      configs.M2_POR_MARIRI *
      configs.ANOS_PARA_COLHEITA_MARIRI
  );

  const areaChacrona = Math.round(
    plantioChacronaPorAno * configs.M2_POR_CHACRONA
  );

  const arvoresPorAno = Math.round(plantioLenhaPorAno / VOLUME_LENHA_M3);

  const areaLenha = Math.round(
    arvoresPorAno *
      configs.M2_POR_ARVORE_LENHA *
      configs.ANOS_PARA_COLHEITA_ARVORE
  );

  const infoData = {
    mariri: {
      title: "Área Ideal de Plantio de Mariri",
      icon: "mariri",
      content: `Considerações para o cultivo de Mariri:

• ${configs.M2_POR_MARIRI}m² necessários para cada pé
• ${configs.ANOS_PARA_COLHEITA_MARIRI} anos entre o plantio e a colheita
• Cálculo baseado no consumo de vegetal/ano
• Inclui ${configs.CRESCIMENTO_ANUAL}% de acréscimo para crescimento
• Considerado o rendimento médio dos preparos`,
    },
    chacrona: {
      title: "Área Ideal para Chacronal",
      icon: "chacrona",
      content: `Considerações para o cultivo de Chacrona:

• ${configs.M2_POR_CHACRONA}m² necessários para cada pé
• Colheita realizada 1 vez por ano em cada pé
• Cálculo baseado no consumo de vegetal/ano
• Inclui ${configs.CRESCIMENTO_ANUAL}% de acréscimo para crescimento
• Considerado o rendimento médio dos preparos`,
    },
    lenha: {
      title: "Área para Plantio de Lenha",
      icon: "lenha",
      content: `Considerações para o plantio de arvores para lenha:

• ${configs.M2_POR_ARVORE_LENHA}m² necessários por árvore plantadaf
• Corte realizado a cada ${configs.ANOS_PARA_COLHEITA_ARVORE} anos
• Volume de ${VOLUME_LENHA_M3}m³ de lenha por árvore
• Cálculo baseado no consumo de vegetal/ano
• Inclui ${configs.CRESCIMENTO_ANUAL}% de acréscimo para crescimento
• Considerado o rendimento médio dos preparos`,
    },
  };

  const hasNoPreparos = !totalPreparos || totalPreparos === 0;
  const hasNoSessoes = !totalSessoes || totalSessoes === 0;
  const showEmptyState = hasNoPreparos || hasNoSessoes;

  if (loadingPreparos || loadingSessoes) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        <Text className="text-gray-600 mt-4 text-base">
          Carregando relatório geral...
        </Text>
      </View>
    );
  }

  if (showEmptyState) {
    return (
      <EmptyRelatorios
        hasNoPreparos={hasNoPreparos}
        hasNoSessoes={hasNoSessoes}
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}
      <ScreenHeader
        left={<DrawerMenuButton />}
        right={
          <TouchableOpacity
            onPress={() => setShowModalConfigs(true)}
            className="bg-white/10 rounded-full"
            activeOpacity={0.7}
          >
            <Settings color="#FFF" size={24} />
          </TouchableOpacity>
        }
        title="Relatório Geral"
        subtitle="Visão consolidada do período"
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="w-full web:max-w-[1100px] web:self-center"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* RESUMO PRINCIPAL */}
        <View className="px-5 mt-6 gap-6">
          <ViewBadge />
          <View className="bg-primary rounded-3xl p-6 shadow-md">
            <View className="flex-row gap-2 items-center justify-between mb-2">
              <Text className="text-white/70 text-sm font-semibold uppercase">
                Dados para Planejamento
              </Text>
              <Text className="text-[0.7rem] text-white/50">
                {configs.CRESCIMENTO_ANUAL}% de Crescimento Anual
              </Text>
            </View>
            <Text className="text-white text-2xl font-bold mb-4">
              {totalPreparos} {totalPreparos === 1 ? "Preparo" : "Preparos"} •{" "}
              {totalSessoes} {totalSessoes === 1 ? "Sessão" : "Sessões"}
            </Text>

            {/* PLANTIO ANUAL */}
            <View className="bg-white/10 rounded-2xl p-4 mb-4">
              <Text className="text-white/90 text-xs font-bold uppercase mb-3 tracking-wide">
                Plantio Anual Necessário
              </Text>
              <View className="gap-2.5">
                <View className="flex-row justify-between items-center">
                  <Text className="text-white/80 text-sm">Mariri</Text>
                  <Text className="text-white font-bold text-base">
                    {plantioMaririPorAno} pés/ano
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-white/80 text-sm">Chacrona</Text>
                  <Text className="text-white font-bold text-base">
                    {plantioChacronaPorAno} pés totais
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-white/80 text-sm">Lenha</Text>
                  <Text className="text-white font-bold text-base">
                    {plantioLenhaPorAno} m³/ano
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-white/80 text-sm">
                    Árvores (ex: Eucalipto)
                  </Text>
                  <Text className="text-white font-bold text-base">
                    {arvoresPorAno} árvores/ano
                  </Text>
                </View>
              </View>
            </View>

            {/* ÁREAS DE PLANTIO COM INFO */}
            <View className="bg-white/10 rounded-2xl p-4">
              <Text className="text-white/90 text-xs font-bold uppercase mb-3 tracking-wide">
                Áreas Totais de Plantio
              </Text>
              <View className="gap-3">
                {/* Mariri */}
                <TouchableOpacity
                  onPress={() => setShowInfoModal(infoData.mariri)}
                  className="bg-white/5 rounded-xl p-3 active:bg-white/10"
                  activeOpacity={0.8}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Sprout color="#FFF" size={18} opacity={0.8} />
                      <Text className="text-white/80 text-sm flex-shrink">
                        Área de Mariri
                      </Text>
                      <Info color="#FFF" size={14} opacity={0.5} />
                    </View>
                    <Text className="text-white font-bold text-base">
                      {areaMariri.toLocaleString()} m²
                    </Text>
                  </View>
                  <Text className="text-white/50 text-xs mt-1.5 ml-6">
                    {plantioMaririPorAno} pés × {configs.M2_POR_MARIRI}m² ×{" "}
                    {configs.ANOS_PARA_COLHEITA_MARIRI} anos
                  </Text>
                </TouchableOpacity>

                {/* Chacrona */}
                <TouchableOpacity
                  onPress={() => setShowInfoModal(infoData.chacrona)}
                  className="bg-white/5 rounded-xl p-3 active:bg-white/10"
                  activeOpacity={0.8}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Sprout color="#FFF" size={18} opacity={0.8} />
                      <Text className="text-white/80 text-sm flex-shrink">
                        Área de Chacrona
                      </Text>
                      <Info color="#FFF" size={14} opacity={0.5} />
                    </View>
                    <Text className="text-white font-bold text-base">
                      {areaChacrona.toLocaleString()} m²
                    </Text>
                  </View>
                  <Text className="text-white/50 text-xs mt-1.5 ml-6">
                    {plantioChacronaPorAno} pés × {configs.M2_POR_CHACRONA}m²
                  </Text>
                </TouchableOpacity>

                {/* Lenha */}
                <TouchableOpacity
                  onPress={() => setShowInfoModal(infoData.lenha)}
                  className="bg-white/5 rounded-xl p-3 active:bg-white/10"
                  activeOpacity={0.8}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2 flex-1">
                      <TreePine color="#FFF" size={18} opacity={0.8} />
                      <Text className="text-white/80 text-sm flex-shrink">
                        Área de Lenha
                      </Text>
                      <Info color="#FFF" size={14} opacity={0.5} />
                    </View>
                    <Text className="text-white font-bold text-base">
                      {areaLenha.toLocaleString()} m²
                    </Text>
                  </View>
                  <Text className="text-white/50 text-xs mt-1.5 ml-6">
                    {arvoresPorAno} árvores × {configs.M2_POR_ARVORE_LENHA}m² ×{" "}
                    {configs.ANOS_PARA_COLHEITA_ARVORE} anos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {/* MÉTRICAS - Consumo de Vegetal */}
          <ExpandableSection title="Consumo de Vegetal">
            <View className="flex-row flex-wrap justify-between gap-y-4">
              <MetricCard
                className="w-[48%]"
                icon={Droplet}
                title="Média de Vegetal"
                value={mediaVegetalAno}
                subtitle="litros por ano"
              />
              <MetricCard
                className="w-[48%]"
                icon={Droplet}
                title="Média de Sessões"
                value={mediaSessoesAno}
                subtitle="por ano"
              />
              <MetricCard
                className="w-[48%]"
                icon={Droplet}
                title="Média de Pessoas"
                value={mediaPessoasPorSessao}
                subtitle="por sessão"
              />
              <MetricCard
                className="w-[48%]"
                icon={Droplet}
                title="Média de Vegetal por Pessoa"
                value={mediaVegetalPorPessoa}
                subtitle="ml por sessão"
              />
            </View>
          </ExpandableSection>
          {/* MÉTRICAS - Preparos */}
          <ExpandableSection title="Preparos">
            <View className="flex-row flex-wrap justify-between gap-y-4">
              <MetricCard
                className="w-[48%]"
                icon={TrendingUp}
                title="Mariri / Vegetal"
                value={maririPorVegetal.toFixed(2)}
                subtitle="kg por litro"
              />
              <MetricCard
                className="w-[48%]"
                icon={TrendingUp}
                title="Chacrona / Vegetal"
                value={chacronaPorVegetal.toFixed(2)}
                subtitle="kg por litro"
              />
              <MetricCard
                className="w-[48%]"
                icon={TrendingUp}
                title="Peso Médio Mariri"
                value={pesoMedioMariri.toFixed(2)}
                subtitle="kg por pé"
              />
              <MetricCard
                className="w-[48%]"
                icon={TrendingUp}
                title="Peso Médio Chacrona"
                value={pesoMedioChacrona.toFixed(2)}
                subtitle="kg por pé"
              />
              <MetricCard
                className="w-[48%]"
                icon={Clock}
                title="Tempo de Fornalha"
                value={tempoMedioFornalha.toFixed(2)}
                subtitle="h por preparo"
              />
              <MetricCard
                className="w-[48%]"
                icon={Droplet}
                title="Média de Litros"
                value={`${mediaLitrosPreparados.toFixed(2)}L`}
                subtitle="por preparo"
              />
              <MetricCard
                className="w-[48%]"
                icon={Flame}
                title="Lenha / Tempo"
                value={consumoLenhaPorTempo.toFixed(2)}
                subtitle="m³ por hora"
              />
              <MetricCard
                className="w-[48%]"
                icon={Flame}
                title="Lenha / Vegetal"
                value={consumoLenhaPorVegetal.toFixed(2)}
                subtitle="m³ por litro"
              />
            </View>
          </ExpandableSection>
        </View>
      </ScrollView>

      {/* MODAL DE INFORMAÇÕES */}
      <Modal
        visible={showInfoModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowInfoModal(null)}
          className="flex-1 bg-black/70 justify-center items-center px-5"
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl"
          >
            {/* Header do Modal */}
            <View className="bg-primary rounded-t-3xl p-5">
              <View className="flex-row items-center gap-3">
                {showInfoModal?.icon === "mariri" && (
                  <Sprout color="#FFF" size={24} />
                )}
                {showInfoModal?.icon === "chacrona" && (
                  <Sprout color="#FFF" size={24} />
                )}
                {showInfoModal?.icon === "lenha" && (
                  <TreePine color="#FFF" size={24} />
                )}
                <Text className="text-white text-lg font-bold flex-1">
                  {showInfoModal?.title}
                </Text>
              </View>
            </View>

            {/* Content */}
            <View className="p-6">
              <Text className="text-gray-700 text-sm leading-6">
                {showInfoModal?.content}
              </Text>
            </View>

            {/* Footer */}
            <View className="p-5 pt-0">
              <TouchableOpacity
                onPress={() => setShowInfoModal(null)}
                className="bg-primary rounded-xl p-4"
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-center text-base">
                  Entendi
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* MODAL DE CONFIGURAÇÕES */}
      <ConfigurationModal
        showModalConfigs={showModalConfigs}
        setShowModalConfigs={setShowModalConfigs}
      />
    </View>
  );
}
