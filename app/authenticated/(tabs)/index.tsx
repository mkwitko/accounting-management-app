"use client";

import DrawerMenuButton from "@/src/components/header/drawer-menu-button";
import ScreenHeader from "@/src/components/header/screen-header";
import { ViewBadge } from "@/src/components/view-badge";
import { useViewContext } from "@/src/context/view-context";
import type { GetSessao200Item } from "@/src/http/generated/api.schemas";
import {
  useDeleteSessaoId,
  useGetSessao,
} from "@/src/http/generated/sessoes/sessoes";
import { AlertModal } from "@/src/pages/sessoes/alert-modal";
import { EmptyState } from "@/src/pages/sessoes/empty-state";
import useRemoveSessaoFromSheet from "@/src/pages/sessoes/hooks/remove-sessao-from-sheet";
import useSyncVegetalSheet from "@/src/pages/vegetal/hooks/sync-vegetal-sheet";
import { SessaoListItem } from "@/src/pages/sessoes/sessao-list-item";
import type { AlertConfig } from "@/src/pages/sessoes/sessao-types";
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

export default function SessoesListScreen() {
  const router = useRouter();
  const { isEnchanced } = useViewContext();
  const { generalView, regionView, nucleoView } = useViewContext();

  const {
    data: sessoesData,
    isLoading: loadingSessoes,
    refetch,
  } = useGetSessao({
    generalView,
    regionView,
    nucleoView,
  });

  const { mutateAsync: deleteSessao, isPending: deleting } =
    useDeleteSessaoId();

  const { removeSessaoFromSheet } = useRemoveSessaoFromSheet();
  const { syncVegetalSheet } = useSyncVegetalSheet();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    type: "success",
    message: "",
    title: "",
    onConfirm: null,
    showCancel: false,
  });

  const itemsPerPage = 20;
  const sessoes = sessoesData || [];

  // Configure Fuse.js for search - memoized
  const fuse = useMemo(
    () =>
      new Fuse(sessoes, {
        keys: ["sessao", "pessoas", "quantidadeVegetal", "descricao", "data"],
        threshold: 0.3,
        includeScore: true,
      }),
    [sessoes],
  );

  // Filtered sessoes - memoized
  const filteredSessoes = useMemo(() => {
    if (!sessoes.length) return [];
    if (searchTerm.trim() === "") return sessoes;
    const results = fuse.search(searchTerm);
    return results.map((result) => result.item);
  }, [searchTerm, sessoes, fuse]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // Displayed sessoes - memoized
  const displayedSessoes = useMemo(
    () => filteredSessoes.slice(0, page * itemsPerPage),
    [filteredSessoes, page, itemsPerPage],
  );

  const hasMoreItems = useMemo(
    () => page * itemsPerPage < filteredSessoes.length,
    [page, itemsPerPage, filteredSessoes.length],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setPage(1);
    setRefreshing(false);
  }, [refetch]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMoreItems) return;

    setLoadingMore(true);
    // Simulate async loading for smooth UX
    requestAnimationFrame(() => {
      setPage((prev) => prev + 1);
      setLoadingMore(false);
    });
  }, [loadingMore, hasMoreItems]);

  const handleEdit = useCallback(
    (sessao: GetSessao200Item) => {
      router.push({
        pathname: "/authenticated/sessao-form",
        params: { id: sessao.id },
      });
    },
    [router],
  );

  const handleDeleteConfirm = useCallback((id: string) => {
    setAlertConfig({
      type: "warning",
      title: "Confirmar Exclusão",
      message:
        "Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.",
      onConfirm: async () => await confirmDelete(id),
      showCancel: true,
    });
    setShowAlert(true);
  }, []);

  const confirmDelete = async (id: string) => {
    const sessao = sessoes.find((sessao) => sessao.id === id);
    try {
      await deleteSessao({ id });
      setAlertConfig({
        type: "success",
        title: "Sucesso!",
        message: "Sessão excluída com sucesso!",
        onConfirm: () => setShowAlert(false),
        showCancel: false,
      });
      const { data: newSessoesData } = await refetch();
      if (sessao) {
        removeSessaoFromSheet(sessao, newSessoesData as GetSessao200Item[]);
      }
      // Excluir sessão devolve litros ao estoque — atualiza a aba.
      if (sessao?.vegetais?.length) {
        syncVegetalSheet().catch(() => { });
      }
    } catch (error) {
      setAlertConfig({
        type: "error",
        title: "Erro",
        message: "Erro ao excluir sessão. Tente novamente.",
        onConfirm: () => setShowAlert(false),
        showCancel: false,
      });
    }
  };

  // Render item for FlatList
  const renderItem = useCallback(
    ({ item, index }: { item: GetSessao200Item; index: number }) => (
      <SessaoListItem
        sessao={item}
        onEdit={handleEdit}
        onDelete={handleDeleteConfirm}
        isDeleting={deleting}
        isLast={index === displayedSessoes.length - 1}
      />
    ),
    [handleEdit, handleDeleteConfirm, deleting, displayedSessoes.length],
  );

  const renderFooter = useCallback(() => {
    if (displayedSessoes.length === 0) return null;

    if (loadingMore) {
      return (
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color="#22c55e" />
          <Text className="text-gray-500 text-sm mt-2">
            Carregando mais sessões...
          </Text>
        </View>
      );
    }

    return null;
  }, [loadingMore, hasMoreItems, displayedSessoes.length]);

  // Empty component
  const renderEmpty = useCallback(
    () => (
      <EmptyState
        hasSearchTerm={searchTerm.trim() !== ""}
        addText="Clique no botão + para adicionar sua primeira sessão"
        notFoundText="Nenhuma sessão encontrada"
      />
    ),
    [searchTerm],
  );

  // Key extractor
  const keyExtractor = useCallback((item: GetSessao200Item) => item.id, []);

  if (loadingSessoes) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="text-gray-600 mt-4">Carregando sessões...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <ScreenHeader
        left={<DrawerMenuButton />}
        title="Sessões"
        subtitle="Gerencie as sessões realizadas"
      />

      <View className="flex-1 px-4 py-6 w-full web:max-w-[1100px] web:self-center">
        <ViewBadge />
        {/* Search Bar */}
        <View className="mb-4 relative mt-6">
          <View className="absolute left-4 top-4 z-10">
            <Search color="#9CA3AF" size={20} />
          </View>
          <TextInput
            placeholder="Pesquisar por tipo, pessoas, quantidade..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-white shadow-sm text-base"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Alert Modal */}
        <AlertModal
          visible={showAlert}
          config={alertConfig}
          onClose={() => setShowAlert(false)}
        />

        {/* List */}
        <View className="bg-white rounded-xl flex-1 shadow-sm overflow-hidden">
          <FlatList
            data={displayedSessoes}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
            initialNumToRender={20}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#22c55e"]}
                tintColor="#22c55e"
                title="Puxe para atualizar"
                titleColor="#6B7280"
              />
            }
          />
          {/* Counter */}
          {displayedSessoes.length > 0 && (
            <View className="py-4 border-t border-gray-100 items-center">
              <Text className="text-gray-600 text-sm">
                Mostrando {displayedSessoes.length} de {filteredSessoes.length}{" "}
                sessões
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Floating Action Button */}
      {!isEnchanced && (
        <TouchableOpacity
          onPress={() => router.push("/authenticated/sessao-form")}
          className="absolute bottom-6 right-6 bg-primary rounded-full w-16 h-16 items-center justify-center shadow-lg active:scale-95"
          activeOpacity={0.8}
        >
          <Plus color="#FFFFFF" size={28} strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </View>
  );
}
