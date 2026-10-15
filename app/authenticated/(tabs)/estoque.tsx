"use client";

import DrawerMenuButton from "@/src/components/header/drawer-menu-button";
import ScreenHeader from "@/src/components/header/screen-header";
import { ViewBadge } from "@/src/components/view-badge";
import { useViewContext } from "@/src/context/view-context";
import type { GetVegetal200Item } from "@/src/http/generated/api.schemas";
import {
  useDeleteVegetalId,
  useGetVegetal,
} from "@/src/http/generated/vegetal/vegetal";
import { AlertModal } from "@/src/pages/sessoes/alert-modal";
import { EmptyState } from "@/src/pages/sessoes/empty-state";
import type { AlertConfig } from "@/src/pages/sessoes/sessao-types";
import { VegetalListItem } from "@/src/pages/vegetal/vegetal-list-item";
import useSyncVegetalSheet from "@/src/pages/vegetal/hooks/sync-vegetal-sheet";
import { formatFloat } from "@/src/utils/format-float";
import { useRouter } from "expo-router";
import Fuse from "fuse.js";
import { Plus, Search } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EstoqueListScreen() {
  const router = useRouter();
  const { isEnchanced, generalView, regionView, nucleoView } = useViewContext();

  const {
    data: vegetaisData,
    isLoading,
    refetch,
  } = useGetVegetal({ generalView, regionView, nucleoView });

  const { mutateAsync: deleteVegetal, isPending: deleting } =
    useDeleteVegetalId();
  const { syncVegetalSheet } = useSyncVegetalSheet();

  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    type: "success",
    message: "",
    title: "",
    onConfirm: null,
    showCancel: false,
  });

  const vegetais = vegetaisData || [];

  const fuse = useMemo(
    () =>
      new Fuse(vegetais, {
        keys: ["nome", "tipo", "mestrePreparo", "observacoes"],
        threshold: 0.3,
      }),
    [vegetais]
  );

  const filtered = useMemo(() => {
    if (!vegetais.length) return [];
    const base =
      searchTerm.trim() === ""
        ? vegetais
        : fuse.search(searchTerm).map((r) => r.item);

    // Ordena por data (mais novo primeiro); sem data vai pro fim.
    // Empate/sem data: ordena por litragem total (maior primeiro).
    return [...base].sort((a, b) => {
      const da = a.dataPreparo ? new Date(a.dataPreparo).getTime() : null;
      const db = b.dataPreparo ? new Date(b.dataPreparo).getTime() : null;
      if (da === null && db !== null) return 1;
      if (da !== null && db === null) return -1;
      if (da !== null && db !== null && da !== db) return db - da;
      const la = formatFloat(a.litrosEstoque) + formatFloat(a.litrosGeladeira);
      const lb = formatFloat(b.litrosEstoque) + formatFloat(b.litrosGeladeira);
      return lb - la;
    });
  }, [searchTerm, vegetais, fuse]);

  const totals = useMemo(() => {
    const estoque = vegetais.reduce(
      (s, v) => s + formatFloat(v.litrosEstoque),
      0
    );
    const geladeira = vegetais.reduce(
      (s, v) => s + formatFloat(v.litrosGeladeira),
      0
    );
    return { estoque, geladeira, total: estoque + geladeira };
  }, [vegetais]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleEdit = useCallback(
    (vegetal: GetVegetal200Item) => {
      router.push({
        pathname: "/authenticated/vegetal-form",
        params: { id: vegetal.id },
      });
    },
    [router]
  );

  const confirmDelete = async (id: string) => {
    try {
      await deleteVegetal({ id });
      setAlertConfig({
        type: "success",
        title: "Sucesso!",
        message: "Vegetal excluído com sucesso!",
        onConfirm: () => setShowAlert(false),
        showCancel: false,
      });
      await refetch();
      syncVegetalSheet().catch(() => { });
    } catch (error) {
      setAlertConfig({
        type: "error",
        title: "Erro",
        message: "Erro ao excluir Vegetal. Tente novamente.",
        onConfirm: () => setShowAlert(false),
        showCancel: false,
      });
    }
  };

  const handleDeleteConfirm = useCallback((id: string) => {
    setAlertConfig({
      type: "warning",
      title: "Confirmar Exclusão",
      message: "Tem certeza que deseja excluir este Vegetal do estoque?",
      onConfirm: async () => await confirmDelete(id),
      showCancel: true,
    });
    setShowAlert(true);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: GetVegetal200Item; index: number }) => (
      <VegetalListItem
        vegetal={item}
        onEdit={handleEdit}
        onDelete={handleDeleteConfirm}
        isDeleting={deleting}
        isLast={index === filtered.length - 1}
      />
    ),
    [handleEdit, handleDeleteConfirm, deleting, filtered.length]
  );

  const renderEmpty = useCallback(
    () => (
      <EmptyState
        hasSearchTerm={searchTerm.trim() !== ""}
        addText="Clique no botão + para adicionar o Vegetal"
        notFoundText="Nenhum Vegetal encontrado"
      />
    ),
    [searchTerm]
  );

  useEffect(() => { }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="text-gray-600 mt-4">Carregando estoque...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        left={<DrawerMenuButton />}
        title="Estoque de Vegetal"
        subtitle="Controle de litros em estoque e geladeira"
      />

      <View className="flex-1 px-4 py-6 w-full web:max-w-[1100px] web:self-center">
        <ViewBadge />

        {/* Resumo de saldos */}
        {vegetais.length > 0 && (
          <View className="flex-row gap-3 mt-6">
            <View className="flex-1 bg-primary-50 rounded-xl p-3">
              <Text className="text-primary-700 text-xs font-medium">
                Estoque
              </Text>
              <Text className="text-primary-800 text-lg font-bold">
                {totals.estoque.toFixed(2)} L
              </Text>
            </View>
            <View className="flex-1 bg-blue-50 rounded-xl p-3">
              <Text className="text-blue-700 text-xs font-medium">
                Geladeira
              </Text>
              <Text className="text-blue-800 text-lg font-bold">
                {totals.geladeira.toFixed(2)} L
              </Text>
            </View>
            <View className="flex-1 bg-gray-100 rounded-xl p-3">
              <Text className="text-gray-600 text-xs font-medium">Total</Text>
              <Text className="text-gray-900 text-lg font-bold">
                {totals.total.toFixed(2)} L
              </Text>
            </View>
          </View>
        )}

        <View className="mb-4 relative mt-6">
          <View className="absolute left-4 top-4 z-10">
            <Search color="#9CA3AF" size={20} />
          </View>
          <TextInput
            placeholder="Pesquisar por nome, tipo, mestre..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-white shadow-sm text-base"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <AlertModal
          visible={showAlert}
          config={alertConfig}
          onClose={() => setShowAlert(false)}
        />

        <View className="bg-white rounded-xl flex-1 shadow-sm overflow-hidden">
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#22c55e"]}
                tintColor="#22c55e"
              />
            }
          />
          {filtered.length > 0 && (
            <View className="py-4 border-t border-gray-100 items-center">
              <Text className="text-gray-600 text-sm">
                {filtered.length} Vegetal no estoque
              </Text>
            </View>
          )}
        </View>
      </View>

      {!isEnchanced && (
        <TouchableOpacity
          onPress={() => router.push("/authenticated/vegetal-form")}
          className="absolute bottom-6 right-6 bg-primary rounded-full w-16 h-16 items-center justify-center active:scale-95"
          activeOpacity={0.8}
        >
          <Plus color="#FFFFFF" size={32} />
        </TouchableOpacity>
      )}
    </View>
  );
}
