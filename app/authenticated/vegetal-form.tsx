import HeaderBackButton from "@/src/components/header/header-back-button";
import ScreenHeader from "@/src/components/header/screen-header";
import KeyboardSpacer from "@/src/components/keyboard-spacer";
import type {
  PostVegetalCreateBody,
  PutVegetalUpdateBody,
} from "@/src/http/generated/api.schemas";
import {
  useGetVegetalId,
  usePostVegetalCreate,
  usePutVegetalUpdate,
} from "@/src/http/generated/vegetal/vegetal";
import { AlertModal } from "@/src/pages/sessoes/alert-modal";
import type { AlertConfig } from "@/src/pages/sessoes/sessao-types";
import { VegetalForm } from "@/src/pages/vegetal/vegetal-form";
import useSyncVegetalSheet from "@/src/pages/vegetal/hooks/sync-vegetal-sheet";
import type { VegetalFormData } from "@/src/pages/vegetal/vegetal-types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function VegetalFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editingId = params.id as string | undefined;

  const { data: vegetal } = useGetVegetalId(editingId ?? "", {
    query: { enabled: !!editingId },
  });
  const { mutateAsync: createVegetal, isPending: creating } =
    usePostVegetalCreate();
  const { mutateAsync: updateVegetal, isPending: updating } =
    usePutVegetalUpdate();
  const { syncVegetalSheet } = useSyncVegetalSheet();

  const [initialValues, setInitialValues] = useState<
    Partial<VegetalFormData> | undefined
  >(undefined);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    type: "success",
    message: "",
    title: "",
    onConfirm: null,
    showCancel: false,
  });

  useEffect(() => {
    if (editingId && vegetal) {
      setInitialValues({
        nome: vegetal.nome,
        tipo: vegetal.tipo as VegetalFormData["tipo"],
        dataPreparo: vegetal.dataPreparo
          ? new Date(vegetal.dataPreparo)
          : undefined,
        mestrePreparo: vegetal.mestrePreparo || "",
        observacoes: vegetal.observacoes || "",
        litrosEstoque: vegetal.litrosEstoque || "",
        litrosGeladeira: vegetal.litrosGeladeira || "",
      });
    }
  }, [editingId, vegetal]);

  const showSuccessAlert = (message: string) => {
    setAlertConfig({
      type: "success",
      title: "Sucesso!",
      message,
      onConfirm: () => {
        setShowAlert(false);
        router.replace("/authenticated/estoque");
      },
      showCancel: false,
    });
    setShowAlert(true);
  };

  const showErrorAlert = (message: string) => {
    setAlertConfig({
      type: "error",
      title: "Erro",
      message,
      onConfirm: () => setShowAlert(false),
      showCancel: false,
    });
    setShowAlert(true);
  };

  const handleSubmit = async (data: VegetalFormData) => {
    try {
      const base = {
        nome: data.nome,
        tipo: data.tipo,
        dataPreparo: data.dataPreparo ? data.dataPreparo.toISOString() : "",
        mestrePreparo: data.mestrePreparo || "",
        observacoes: data.observacoes || null,
        litrosEstoque: data.litrosEstoque || "0",
        litrosGeladeira: data.litrosGeladeira || "0",
      };

      if (editingId) {
        await updateVegetal({
          data: { id: editingId, ...base } as PutVegetalUpdateBody,
        });
        showSuccessAlert("Vegetal atualizado com sucesso!");
      } else {
        await createVegetal({ data: base as PostVegetalCreateBody });
        showSuccessAlert("Vegetal cadastrado com sucesso!");
      }
      // Atualiza a aba "Estoque de Vegetal" da planilha.
      syncVegetalSheet().catch(() => {});
    } catch (error) {
      showErrorAlert("Erro ao salvar Vegetal. Tente novamente.");
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        left={
          <HeaderBackButton
            label=""
            onPress={() => router.replace("/authenticated/estoque")}
          />
        }
        title={editingId ? "Editar Vegetal" : "Novo Vegetal"}
        subtitle={
          editingId
            ? "Atualize os dados do Vegetal"
            : "Cadastre um Vegetal no estoque"
        }
      />

      {editingId && !initialValues ? (
        <View className="flex-1 py-12 items-center">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-gray-600 mt-4">Carregando dados...</Text>
        </View>
      ) : (
        <VegetalForm
          onSubmit={handleSubmit}
          isSubmitting={creating || updating}
          initialValues={initialValues}
          onCancel={() => router.replace("/authenticated/estoque")}
        />
      )}

      <AlertModal
        visible={showAlert}
        config={alertConfig}
        onClose={() => setShowAlert(false)}
      />

      <KeyboardSpacer />
    </View>
  );
}
