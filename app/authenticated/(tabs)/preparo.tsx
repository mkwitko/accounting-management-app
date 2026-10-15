"use client";

import DrawerMenuButton from "@/src/components/header/drawer-menu-button";
import ScreenHeader from "@/src/components/header/screen-header";
import { ViewBadge } from "@/src/components/view-badge";
import { useViewContext } from "@/src/context/view-context";
import type { GetAllPreparos200Item } from "@/src/http/generated/api.schemas";
import {
  useDeletePreparo,
  useGetAllPreparos,
} from "@/src/http/generated/preparos/preparos";
import useRemovePreparoSheet from "@/src/pages/preparos/hooks/use-remove-preparo-sheet";
import { PreparoListItem } from "@/src/pages/preparos/preparo-list-item";
import { AlertModal } from "@/src/pages/sessoes/alert-modal";
import { EmptyState } from "@/src/pages/sessoes/empty-state";
import type { AlertConfig } from "@/src/pages/sessoes/sessao-types";
import { COLORS } from "@/src/styles/colors";
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

export default function PreparosListScreen() {
  const router = useRouter();
  const { generalView, regionView, nucleoView, isEnchanced } = useViewContext();
  const {
    data: preparosData,
    isLoading: loadingPreparos,
    refetch,
  } = useGetAllPreparos({
    generalView,
    regionView,
    nucleoView,
  });

  const { mutateAsync: deletePreparo, isPending: deleting } =
    useDeletePreparo();

  const { removePreparoSheet } = useRemovePreparoSheet();

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
  const preparos = preparosData || [];

  const fuse = useMemo(
    () =>
      new Fuse(preparos, {
        keys: [
          "producaoLitros",
          "mariri.tipo",
          "chacrona.tipo",
          "lenha.tipoLenha",
        ],
        threshold: 0.3,
        includeScore: true,
      }),
    [preparos]
  );

  const filteredPreparos = useMemo(() => {
    if (!preparos.length) return [];
    if (searchTerm.trim() === "") return preparos;
    const results = fuse.search(searchTerm);
    return results.map((result) => result.item);
  }, [searchTerm, preparos, fuse]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const displayedPreparos = useMemo(
    () => filteredPreparos.slice(0, page * itemsPerPage),
    [filteredPreparos, page, itemsPerPage]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setPage(1);
    setRefreshing(false);
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || page * itemsPerPage >= filteredPreparos.length) return;
    setLoadingMore(true);
    requestAnimationFrame(() => {
      setPage((prev) => prev + 1);
      setLoadingMore(false);
    });
  }, [loadingMore, page, itemsPerPage, filteredPreparos.length]);

  const handleEdit = useCallback(
    (preparo: GetAllPreparos200Item) => {
      router.push({
        pathname: "/authenticated/preparo-form",
        params: { id: preparo.id },
      });
    },
    [router]
  );

  const handleDeleteConfirm = useCallback((id: string) => {
    setAlertConfig({
      type: "warning",
      title: "Confirmar Exclusão",
      message:
        "Tem certeza que deseja excluir este preparo? Esta ação não pode ser desfeita.",
      onConfirm: async () => await confirmDelete(id),
      showCancel: true,
    });
    setShowAlert(true);
  }, []);

  const confirmDelete = async (id: string) => {
    try {
      const preparo = preparos.find((p) => p.id === id);
      await deletePreparo({ id });
      setAlertConfig({
        type: "success",
        title: "Sucesso!",
        message: "Preparo excluído com sucesso!",
        onConfirm: () => setShowAlert(false),
        showCancel: false,
      });
      const { data: updatedPreparos } = await refetch();
      if (preparo) {
        removePreparoSheet(preparo, updatedPreparos || []);
      }
    } catch (error) {
      setAlertConfig({
        type: "error",
        title: "Erro",
        message: "Erro ao excluir preparo. Tente novamente.",
        onConfirm: () => setShowAlert(false),
        showCancel: false,
      });
    }
  };

  const renderItem = useCallback(
    ({ item, index }: { item: GetAllPreparos200Item; index: number }) => (
      <PreparoListItem
        preparo={item}
        onEdit={handleEdit}
        onDelete={handleDeleteConfirm}
        isDeleting={deleting}
        isLast={index === displayedPreparos.length - 1}
      />
    ),
    [handleEdit, handleDeleteConfirm, deleting, displayedPreparos.length]
  );

  const renderFooter = useCallback(() => {
    const hasMore = page * itemsPerPage < filteredPreparos.length;

    if (loadingMore && hasMore) {
      return (
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color={COLORS.primary.DEFAULT} />
          <Text className="text-gray-500 mt-2 text-sm">
            Carregando mais preparos...
          </Text>
        </View>
      );
    }

    return null;
  }, [
    loadingMore,
    page,
    itemsPerPage,
    filteredPreparos.length,
    displayedPreparos.length,
  ]);

  const renderEmpty = useCallback(
    () => (
      <EmptyState
        hasSearchTerm={searchTerm.trim() !== ""}
        addText="Clique no botão + para adicionar seu primeiro preparo"
        notFoundText="Nenhum preparo encontrado"
      />
    ),
    [searchTerm]
  );

  const keyExtractor = useCallback(
    (item: GetAllPreparos200Item) => item.id,
    []
  );

  if (loadingPreparos) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        <Text className="text-gray-600 mt-4">Carregando preparos...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <ScreenHeader
        left={<DrawerMenuButton />}
        title="Preparo"
        subtitle={`Gerencie os preparos realizados • ${filteredPreparos.length} ${
          filteredPreparos.length === 1 ? "preparo" : "preparos"
        }`}
      />

      <View className="flex-1 px-4 py-6 w-full web:max-w-[1100px] web:self-center">
        <ViewBadge />
        {/* Search Bar */}
        <View className="my-6 relative">
          <View className="absolute left-4 top-4 z-10">
            <Search color="#9CA3AF" size={20} />
          </View>
          <TextInput
            placeholder="Pesquisar por produção, mariri, chacrona..."
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
            data={displayedPreparos}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary.DEFAULT]}
                tintColor={COLORS.primary.DEFAULT}
              />
            }
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
            initialNumToRender={20}
          />

          {/* Counter */}
          {displayedPreparos.length > 0 && (
            <View className="py-4 border-t border-gray-100 items-center">
              <Text className="text-gray-600 text-sm">
                Mostrando {displayedPreparos.length} de{" "}
                {filteredPreparos.length} preparos
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Floating Action Button */}
      {!isEnchanced && (
        <TouchableOpacity
          onPress={() => router.push("/authenticated/preparo-form")}
          className="absolute bottom-6 right-6 bg-primary-600 rounded-full w-16 h-16 items-center justify-center shadow-lg active:scale-95"
          activeOpacity={0.8}
        >
          <Plus color="#FFFFFF" size={28} strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </View>
  );
}
