import ScreenHeader from "@/src/components/header/screen-header";
import KeyboardSpacer from "@/src/components/keyboard-spacer";
import { useViewContext } from "@/src/context/view-context";
import {
  FindMe201,
  GetSessao200Item,
  PostSessaoCreateBody,
  PutSessaoUpdateBody,
} from "@/src/http/generated/api.schemas";
import {
  useGetSessao,
  useGetSessaoId,
  usePostSessaoCreate,
  usePutSessaoUpdate,
} from "@/src/http/generated/sessoes/sessoes";
import { useFindMe } from "@/src/http/generated/user/user";
import { AlertModal } from "@/src/pages/sessoes/alert-modal";
import useAddSessaoToSheet from "@/src/pages/sessoes/hooks/add-sessao-to-sheet";
import useSyncVegetalSheet from "@/src/pages/vegetal/hooks/sync-vegetal-sheet";
import { SessaoForm } from "@/src/pages/sessoes/sessao-form";
import {
  type AlertConfig,
  type SessaoFormData,
} from "@/src/pages/sessoes/sessao-types";
import HeaderBackButton from "@/src/components/header/header-back-button";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function SessaoFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editingId = params.id as string | undefined;

  const { generalView, regionView, nucleoView } = useViewContext();

  const { data: user } = useFindMe();
  const { data: sessoesData, refetch } = useGetSessao({
    generalView,
    regionView,
    nucleoView,
  });
  // Prefill de edição: busca a sessão por id (confiável, sem depender do
  // filtro de view da lista, que pode excluir a sessão ou não hidratar vegetais).
  const { data: sessaoById } = useGetSessaoId(editingId ?? "", {
    query: { enabled: !!editingId },
  });
  const { mutateAsync: createSessao, isPending: creating } =
    usePostSessaoCreate();
  const { mutateAsync: updateSessao, isPending: updating } =
    usePutSessaoUpdate();
  const { addSessaoToSheet } = useAddSessaoToSheet();
  const { syncVegetalSheet } = useSyncVegetalSheet();

  const [initialValues, setInitialValues] = useState<
    Partial<SessaoFormData> | undefined
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
    if (editingId && sessaoById) {
      const sessao = sessaoById;

      console.log("SessaoFormScreen: prefill initialValues", sessao);

      setInitialValues({
        sessao: sessao.sessao,
        pessoas: sessao.pessoas.toString(),
        quantidadeVegetal: sessao.quantidadeVegetal.toString(),
        descricao: sessao.descricao || "",
        data: new Date(sessao.data),
        nucleoId: user?.nucleo?.id,
        vegetais: (sessao.vegetais || []).length
          ? (sessao.vegetais || []).map((v) => ({
            vegetalId: v.vegetalId,
            local: (v.local as "estoque" | "geladeira") || "estoque",
            quantidade: v.quantidade,
            filtrado: (v as { filtrado?: string }).filtrado ?? "",
          }))
          : // Sem vegetal detalhado: cria uma linha só com a litragem
            // consumida, sem vegetal escolhido (não desconta estoque).
            [
              {
                vegetalId: "",
                local: "estoque" as const,
                quantidade:
                  sessao.quantidadeVegetal?.toString().replace(".", ",") ?? "",
                filtrado: "",
              },
            ],
      });
    }
  }, [editingId, sessaoById, user]);

  const num = (v?: string) => Number(String(v ?? "").replace(",", ".") || 0);

  // Salva a sessão. `descontar` desconta o filtrado; `geladeira` joga a diff na geladeira.
  const persist = async (
    data: SessaoFormData,
    descontar: boolean,
    geladeira: boolean
  ) => {
    try {
      // Todas as linhas com quantidade contam no total (consumido).
      const linhas = (data.vegetais || []).filter((v) => v.quantidade);
      // Linhas com vegetal escolhido (detalhe + desconto).
      const comVegetal = linhas.filter((v) => v.vegetalId);

      // Total consumido: soma de todas as linhas; senão o valor manual.
      const total = linhas.length
        ? linhas.reduce((s, v) => s + num(v.quantidade), 0).toFixed(2)
        : String(data.quantidadeVegetal ?? "0");

      const payload: PutSessaoUpdateBody | PostSessaoCreateBody = {
        sessao: data.sessao,
        pessoas: data.pessoas,
        quantidadeVegetal: total,
        // descricao: data.descricao || "",
        data: data.data.toISOString(),
        nucleosId: data.nucleoId,
        vegetais: comVegetal.length
          ? comVegetal.map((v) => ({
            vegetalId: v.vegetalId,
            local: v.local,
            quantidade: v.quantidade,
            // Filtrado é o que sai do estoque; sem valor, usa o consumido.
            filtrado: v.filtrado || v.quantidade,
          }))
          : undefined,
        descontarEstoque: descontar,
        adicionarGeladeira: geladeira,
      };

      if (editingId) {
        await updateSessao({
          data: { id: editingId, ...payload },
        });
        showSuccessAlert("Sessão atualizada com sucesso!");
      } else {
        await createSessao({ data: payload });
        showSuccessAlert("Sessão criada com sucesso!");
      }
      const { data: newSessoesData } = await refetch();
      addSessaoToSheet(
        payload,
        newSessoesData as GetSessao200Item[],
        user as FindMe201
      );

      // Consumo mexeu no saldo — atualiza a aba de estoque.
      if (comVegetal.length && descontar) {
        syncVegetalSheet().catch(() => { });
      }
    } catch (error) {
      showErrorAlert("Erro ao salvar sessão. Tente novamente.");
    }
  };

  // Passo 2: pergunta se joga a diferença (filtrado - consumido) na geladeira.
  const perguntarGeladeira = (data: SessaoFormData) => {
    setAlertConfig({
      type: "warning",
      title: "Adicionar diferença na geladeira?",
      message:
        "A diferença entre o filtrado e o consumido vira saldo na geladeira. Deseja adicionar?",
      showCancel: true,
      confirmText: "Sim, adicionar",
      cancelText: "Não",
      onConfirm: () => {
        setShowAlert(false);
        persist(data, true, true);
      },
      onCancel: () => {
        setShowAlert(false);
        persist(data, true, false);
      },
    });
    setShowAlert(true);
  };

  const handleSubmit = async (data: SessaoFormData) => {
    // Linhas com vegetal escolhido (descontariam do estoque).
    const comVegetal = (data.vegetais || []).filter(
      (v) => v.vegetalId && v.quantidade
    );

    // Sem vegetal escolhido → salva direto, sem mexer no estoque.
    if (!comVegetal.length) {
      await persist(data, false, false);
      return;
    }

    // Há diferença positiva (filtrado > consumido) em alguma linha?
    const temDiff = comVegetal.some(
      (v) => num(v.filtrado || v.quantidade) - num(v.quantidade) > 0
    );

    // Passo 1: pergunta se quer descontar do estoque.
    setAlertConfig({
      type: "warning",
      title: "Descontar do estoque?",
      message:
        "O filtrado dos vegetais selecionados será descontado do estoque. Deseja descontar?",
      showCancel: true,
      confirmText: "Sim, descontar",
      cancelText: "Não descontar",
      onConfirm: () => {
        // Só faz sentido perguntar da geladeira se houver diferença.
        if (temDiff) {
          perguntarGeladeira(data);
        } else {
          setShowAlert(false);
          persist(data, true, false);
        }
      },
      onCancel: () => {
        setShowAlert(false);
        persist(data, false, false);
      },
    });
    setShowAlert(true);
  };

  const showSuccessAlert = (message: string) => {
    setAlertConfig({
      type: "success",
      title: "Sucesso!",
      message,
      onConfirm: () => {
        setShowAlert(false);
        router.back();
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

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <ScreenHeader
        left={<HeaderBackButton label="" onPress={() => router.back()} />}
        title={editingId ? "Editar Sessão" : "Nova Sessão"}
        subtitle={
          editingId
            ? "Atualize as informações da sessão"
            : "Preencha os dados da nova sessão"
        }
      />

      {editingId && !initialValues ? (
        <View className="flex-1 py-12 items-center">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-gray-600 mt-4">Carregando dados...</Text>
        </View>
      ) : (
        <SessaoForm
          onSubmit={handleSubmit}
          isSubmitting={creating || updating}
          initialValues={initialValues}
          onCancel={() => router.back()}
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
