import { useRouter } from "expo-router";
import { Droplet, Clock, Info } from "lucide-react-native";
import React from "react";
import { View, ScrollView, Text } from "react-native";
import { EmptyStateCard } from "./empty-card";
import DrawerMenuButton from "./header/drawer-menu-button";
import Header from "./header/header";
import HeaderTitle from "./header/header-title";

export default function EmptyRelatorios({
  hasNoPreparos,
  hasNoSessoes,
}: {
  hasNoPreparos: boolean;
  hasNoSessoes: boolean;
}) {
  const router = useRouter();
  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}
      <Header>
        <View className="flex flex-row items-start justify-between">
          <DrawerMenuButton />
          <View className="flex-1 items-center">
            <HeaderTitle title="Relatório Geral" />
            <Text className="text-white/70 mt-1 text-sm font-medium text-center">
              Comece adicionando seus dados
            </Text>
          </View>
        </View>
      </Header>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="px-5">
          {/* Estado vazio quando faltam ambos */}
          {hasNoPreparos && hasNoSessoes && (
            <View className="gap-4 mt-6">
              <EmptyStateCard
                icon={Droplet}
                title="Nenhum Preparo Cadastrado"
                description="Para gerar o relatório, você precisa cadastrar pelo menos um preparo."
                actionText="Ir para Preparos"
                onAction={() => {
                  router.replace("/authenticated/(tabs)/preparo");
                }}
              />

              <EmptyStateCard
                icon={Clock}
                title="Nenhuma Sessão Cadastrada"
                description="As sessões são necessárias para calcular o consumo médio de Vegetal e o planejamento de plantio."
                actionText="Ir para Sessões"
                onAction={() => {
                  router.replace("/authenticated/(tabs)");
                }}
              />
            </View>
          )}

          {/* Estado vazio quando falta apenas preparos */}
          {hasNoPreparos && !hasNoSessoes && (
            <View className="mt-6">
              <EmptyStateCard
                icon={Droplet}
                title="Nenhum Preparo Cadastrado"
                description="Você já tem sessões cadastradas! Agora cadastre seus preparos para ter uma visão completa do consumo de materiais e planejamento de plantio."
                actionText="Cadastrar Primeiro Preparo"
                onAction={() => {
                  // Adicionar navegação para tela de preparos
                  console.log("Navegar para preparos");
                }}
              />
            </View>
          )}

          {/* Estado vazio quando falta apenas sessões */}
          {!hasNoPreparos && hasNoSessoes && (
            <View className="mt-6">
              <EmptyStateCard
                icon={Clock}
                title="Nenhuma Sessão Cadastrada"
                description="Você já tem preparos cadastrados! Agora cadastre suas sessões para calcular o consumo médio de Vegetal e melhorar o planejamento."
                actionText="Cadastrar Primeira Sessão"
                onAction={() => {
                  // Adicionar navegação para tela de sessões
                  console.log("Navegar para sessões");
                }}
              />
            </View>
          )}

          {/* Card informativo */}
          <View className="mt-6 bg-primary-50 rounded-2xl p-5 border border-primary-100">
            <View className="flex-row items-start gap-3">
              <View className="bg-primary-500 rounded-full p-2 mt-0.5">
                <Info color="#FFF" size={16} />
              </View>
              <View className="flex-1">
                <Text className="text-primary-900 font-bold text-base mb-1">
                  Como funciona?
                </Text>
                <Text className="text-primary-700 text-sm leading-5">
                  O relatório geral calcula automaticamente as áreas de plantio
                  necessárias com base nos seus preparos e sessões cadastrados.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
