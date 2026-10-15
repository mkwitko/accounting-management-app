import usePreparosSheets from "@/src/components/google-sheets/hooks/use-preparos-sheets";
import useResultadosSheets from "@/src/components/google-sheets/hooks/use-resultados-sheets";
import useSessoesSheets from "@/src/components/google-sheets/hooks/use-sessoes-sheets";
import DrawerMenuButton from "@/src/components/header/drawer-menu-button";
import ScreenHeader from "@/src/components/header/screen-header";
import ConfirmationModal from "@/src/components/integrations/confirmation-modal";
import SheetsList from "@/src/components/integrations/sheets-list";
import StatusBadge from "@/src/components/integrations/status-badge";
import { ViewBadge } from "@/src/components/view-badge";
import { PERMISSIONS_ENUM } from "@/src/@types/permissions";
import { useAuthContext } from "@/src/context/auth-context";
import { useViewContext } from "@/src/context/view-context";
import useGetSheetName from "@/src/hooks/get-sheet-name";
import { FindMe201 } from "@/src/http/generated/api.schemas";
import {
  useCheckAuthStatus,
  useInitiateGoogleAuth,
  useLogoutUser,
} from "@/src/http/generated/auth/auth";
import { useGetAllPreparos } from "@/src/http/generated/preparos/preparos";
import { useGetSessao } from "@/src/http/generated/sessoes/sessoes";
import {
  useCreateOrUpdateMultiSheet,
  useListUserSheets,
} from "@/src/http/generated/sheets/sheets";
import { queryClient } from "@/src/lib/react-query";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { FileSpreadsheet, RefreshCw } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PAGE_SIZE = 20;

export default function Integrations() {
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [allSheets, setAllSheets] = useState<any[]>([]);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const router = useRouter();
  const { user, userHasRole } = useAuthContext();
  const { generalView, regionView, nucleoView, configs } = useViewContext();

  // Exportar próprio núcleo é livre; região/geral exige EXPORTAR_REGIOES;
  // outro núcleo exige EXPORTAR_NUCLEOS (ou superior).
  const canExport =
    generalView || regionView
      ? userHasRole(PERMISSIONS_ENUM.EXPORTAR_REGIOES)
      : nucleoView
        ? userHasRole([
            PERMISSIONS_ENUM.EXPORTAR_NUCLEOS,
            PERMISSIONS_ENUM.EXPORTAR_REGIOES,
          ])
        : true;

  const {
    data: authStatus,
    isLoading: isLoadingAuthStatus,
    refetch: refetchAuthStatus,
  } = useCheckAuthStatus();

  const { data: authUrl, isLoading: isLoadingAuthUrl } = useInitiateGoogleAuth({
    query: {
      enabled: !authStatus?.authenticated,
    },
  });

  const { data: preparos } = useGetAllPreparos({
    generalView,
    regionView,
    nucleoView,
  });

  const { data: sessoes } = useGetSessao({
    generalView,
    regionView,
    nucleoView,
  });

  const { mutate: logoutGoogle, isPending: isLoggingOut } = useLogoutUser();
  const { mutateAsync: createSheet, isPending: isCreatingSheet } =
    useCreateOrUpdateMultiSheet();

  const {
    data: listSheets,
    isLoading: isLoadingSheets,
    refetch: refetchSheets,
    isRefetching: isRefetchingSheets,
    queryKey: sheetsQueryKey,
  } = useListUserSheets(
    {
      pageSize: PAGE_SIZE,
      pageToken: pageToken,
    },
    {
      query: {
        enabled: !!authStatus?.authenticated && hasMorePages,
      },
    }
  );

  // Effect para processar novos dados quando chegarem
  useEffect(() => {
    if (listSheets?.sheets) {
      setAllSheets((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const newSheets = listSheets.sheets.filter(
          (s) => !existingIds.has(s.id)
        );
        return [...prev, ...newSheets];
      });

      setHasMorePages(!!listSheets.nextPageToken);
      setIsLoadingMore(false);
    }
  }, [listSheets]);

  const loadMoreSheets = useCallback(() => {
    if (listSheets?.nextPageToken && hasMorePages && !isLoadingMore) {
      setIsLoadingMore(true);
      setPageToken(listSheets.nextPageToken);
    }
  }, [listSheets?.nextPageToken, hasMorePages, isLoadingMore]);

  const resetSheets = useCallback(() => {
    console.log("Resetting sheets...");
    setAllSheets([]);
    setPageToken(undefined);
    setHasMorePages(true);
    setIsLoadingMore(false);
    refetchSheets();
  }, [refetchSheets]);

  // Handler de deep link com useCallback
  const handleDeepLink = useCallback(
    async (url: string) => {
      try {
        // Fechar navegador primeiro
        await WebBrowser.dismissBrowser();

        const parsedUrl = new URL(url);
        const session = parsedUrl.searchParams.get("session");
        const error = parsedUrl.searchParams.get("error");

        if (error) {
          return;
        }

        if (session) {
          // Aguardar backend processar
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const newAuthStatus = await refetchAuthStatus();

          if (newAuthStatus?.data?.authenticated) {
            resetSheets();
          } else {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const retryStatus = await refetchAuthStatus();

            if (retryStatus?.data?.authenticated) {
              resetSheets();
            }
          }
        }
      } catch (err) {
        console.error("Error processing deep link:", err);
      }
    },
    [refetchAuthStatus, resetSheets]
  );

  // Setup deep link listener
  useEffect(() => {
    console.log("=== Setting up deep link listener ===");

    const handleUrlEvent = ({ url }: { url: string }) => {
      handleDeepLink(url);
    };

    const subscription = Linking.addEventListener("url", handleUrlEvent);

    // Verificar cold start
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      console.log("=== Removing deep link listener ===");
      subscription.remove();
    };
  }, [handleDeepLink]);

  const handleConnect = async () => {
    if (!authUrl?.authUrl) {
      console.error("Auth URL not available");
      return;
    }

    try {
      await WebBrowser.warmUpAsync();
      const result = await WebBrowser.openBrowserAsync(authUrl.authUrl);
    } catch (err) {
      console.error("Error initiating Google OAuth:", err);
    } finally {
      await WebBrowser.coolDownAsync();
    }
  };

  const handleDisconnect = () => {
    setShowDisconnectModal(true);
  };

  const handleSyncClick = () => {
    setShowSyncModal(true);
  };

  const handleSyncConfirm = () => {
    handleExportToSheets(true);
  };

  const confirmDisconnect = async () => {
    setShowDisconnectModal(false);
    await logoutGoogle();
    await refetchAuthStatus();
    await queryClient.setQueryData(sheetsQueryKey, undefined);
    setAllSheets([]);
    setPageToken(undefined);
    setHasMorePages(true);
    setIsLoadingMore(false);
  };

  const { handleGetSessoesData } = useSessoesSheets();
  const { handleGetPreparosData } = usePreparosSheets();
  const { getSheetName } = useGetSheetName();
  const { handleGetResultadosData } = useResultadosSheets(configs);

  const handleExportToSheets = async (isSync = false) => {
    try {
      const { sessoesHeaders, sessoesData } = handleGetSessoesData();
      const { data: preparoData, merges: preparoMerges } =
        handleGetPreparosData();
      const { data, merges, getFormattingRequests } = handleGetResultadosData({
        preparos: preparos || [],
        sessoes: sessoes || [],
        user: user as FindMe201,
      });

      await createSheet({
        data: {
          title: getSheetName(),
          sessoes: [sessoesHeaders, ...(sessoesData ?? [])],
          preparos: preparoData,
          preparosMerges: preparoMerges,
          resultados: data,
          resultadosMerges: merges,
          resultadosFormatting: getFormattingRequests(0),
        },
      });

      if (isSync) {
        setShowSyncModal(false);
        resetSheets();
      }
    } catch (err: any) {
      console.error("Error exporting to sheets:", err);
      if (isSync) {
        setShowSyncModal(false);
      }
    }
  };

  return (
    <View className="flex-1">
      <ScreenHeader
        left={<DrawerMenuButton />}
        title="Integrações"
        subtitle="Conecte e sincronize dados externos"
      />

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerClassName="pb-6 w-full web:max-w-[1100px] web:self-center"
        showsVerticalScrollIndicator={false}
      >
        {isLoadingAuthStatus && (
          <View className="bg-white rounded-2xl p-8 mb-4 items-center shadow-sm">
            <ActivityIndicator color="#16A34A" size="large" />
            <Text className="text-gray-500 mt-3 text-sm font-medium">
              Verificando autenticação...
            </Text>
          </View>
        )}

        {authStatus?.authenticated && authStatus.usuario?.nome && (
          <View className="bg-primary-50 rounded-2xl p-4 mb-4 border border-green-100">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mr-3">
                <Text className="text-white text-lg font-bold">
                  {authStatus.usuario.nome.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-sm">
                  {authStatus.usuario.nome}
                </Text>
                <Text className="text-green-700 text-xs font-medium mt-0.5">
                  Conectado ao Google
                </Text>
              </View>
              <View className="w-2 h-2 rounded-full bg-green-500" />
            </View>
          </View>
        )}

        <ViewBadge />

        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <View className="p-5 border-b border-gray-50">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-2xl bg-primary-500 items-center justify-center mr-3 shadow-sm">
                  <FileSpreadsheet color="#FFFFFF" size={24} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base">
                    Google Sheets
                  </Text>
                  <Text className="text-gray-500 text-xs mt-0.5 font-medium">
                    Sincronização automática
                  </Text>
                </View>
              </View>
              <StatusBadge isActive={authStatus?.authenticated ?? false} />
            </View>
          </View>

          <View className="p-4 gap-2.5">
            {authStatus?.authenticated && canExport && (
              <TouchableOpacity
                onPress={handleSyncClick}
                disabled={isCreatingSheet}
                className="bg-primary-600 p-3.5 rounded-xl shadow-sm active:scale-98"
                activeOpacity={0.9}
              >
                <View className="flex-row items-center justify-center">
                  <RefreshCw color="#FFFFFF" size={18} strokeWidth={2.5} />
                  <Text className="text-white font-bold text-sm ml-2">
                    Sincronizar Dados (visualização atual)
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {authStatus?.authenticated && !canExport && (
              <Text className="text-gray-500 text-xs text-center px-2">
                Você não tem permissão para exportar esta visualização.
              </Text>
            )}

            <TouchableOpacity
              onPress={() =>
                authStatus?.authenticated ? handleDisconnect() : handleConnect()
              }
              disabled={isLoggingOut || isLoadingAuthUrl}
              className={`p-3.5 rounded-xl ${
                authStatus?.authenticated
                  ? "bg-red-50 border border-red-200"
                  : "bg-primary-600"
              }`}
              activeOpacity={0.9}
            >
              {isLoggingOut || isLoadingAuthUrl ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator
                    color={authStatus?.authenticated ? "#DC2626" : "#FFFFFF"}
                    size="small"
                  />
                  <Text
                    className={`font-semibold text-sm ml-2 ${
                      authStatus?.authenticated ? "text-red-600" : "text-white"
                    }`}
                  >
                    {authStatus?.authenticated
                      ? "Desconectando..."
                      : "Conectando..."}
                  </Text>
                </View>
              ) : (
                <Text
                  className={`text-center font-bold text-sm ${
                    authStatus?.authenticated ? "text-red-600" : "text-white"
                  }`}
                >
                  {authStatus?.authenticated
                    ? "Desconectar Conta"
                    : "Conectar Agora"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {authStatus?.authenticated && (
            <SheetsList
              sheets={allSheets}
              isLoading={isLoadingSheets && allSheets.length === 0}
              isRefetching={isRefetchingSheets}
              refetchSheets={resetSheets}
              onLoadMore={loadMoreSheets}
              hasMore={hasMorePages}
              isLoadingMore={isLoadingMore}
            />
          )}
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onConfirm={handleSyncConfirm}
        title="Sincronizar Planilhas"
        description="Esta ação irá sobrescrever as planilhas criadas pelo app, com os dados mais recentes. Deseja continuar?"
        confirmText="Sim, Sincronizar"
        isLoading={isCreatingSheet}
        loadingText="Sincronizando..."
        variant="warning"
      />

      <ConfirmationModal
        visible={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        onConfirm={confirmDisconnect}
        title="Desconectar Conta"
        description="Tem certeza que deseja desconectar sua conta do Google? Você precisará autenticar novamente para usar esta integração."
        confirmText="Sim, Desconectar"
        isLoading={isLoggingOut}
        loadingText="Desconectando..."
        variant="danger"
      />
    </View>
  );
}
