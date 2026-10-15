import HeaderBackButton from "@/src/components/header/header-back-button";
import ScreenHeader from "@/src/components/header/screen-header";
import { useAuthContext } from "@/src/context/auth-context";
import { getFindMeQueryKey } from "@/src/http/generated/user/user";
import { customInstance } from "@/src/lib/api";
import { queryClient } from "@/src/lib/react-query";
import { useRouter } from "expo-router";
import { Boxes, Plug } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Config = {
  estoqueAtivo: boolean;
  integracoesAtivo: boolean;
};

const OPTIONS: {
  key: keyof Config;
  title: string;
  description: string;
  Icon: typeof Boxes;
}[] = [
  {
    key: "estoqueAtivo",
    title: "Controle de estoque",
    description:
      "Cadastro de vegetal, saldos e desconto do estoque ao registrar sessões.",
    Icon: Boxes,
  },
  {
    key: "integracoesAtivo",
    title: "Integrações",
    description: "Sincronização com planilhas e serviços externos.",
    Icon: Plug,
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuthContext();

  const [config, setConfig] = useState<Config>({
    estoqueAtivo: false,
    integracoesAtivo: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setConfig({
        // Estoque é por núcleo; integrações é por usuário.
        estoqueAtivo: !!user.nucleo?.estoqueAtivo,
        integracoesAtivo: !!user.integracoesAtivo,
      });
    }
  }, [user]);

  const toggle = async (key: keyof Config, value: boolean) => {
    const next = { ...config, [key]: value };
    setConfig(next);
    setSaving(true);
    try {
      // Estoque é por núcleo; integrações é por usuário.
      const url =
        key === "integracoesAtivo" ? "/user/config" : "/nucleo/config";
      await customInstance({
        url,
        method: "PUT",
        data: { [key]: value },
      });
      await queryClient.invalidateQueries({ queryKey: getFindMeQueryKey() });
    } catch {
      // Reverte em caso de erro.
      setConfig(config);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        left={<HeaderBackButton label="" onPress={() => router.back()} />}
        title="Configurações"
        subtitle="Ative as funcionalidades disponíveis"
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 w-full web:max-w-2xl web:self-center"
        showsVerticalScrollIndicator={false}
      >
        {saving && (
          <View className="flex-row items-center gap-2 mb-3">
            <ActivityIndicator size="small" color="#4a7c32" />
            <Text className="text-gray-500 text-xs">Salvando...</Text>
          </View>
        )}

        {OPTIONS.map(({ key, title, description, Icon }) => (
          <TouchableOpacity
            key={key}
            activeOpacity={0.8}
            onPress={() => toggle(key, !config[key])}
            className="flex-row items-center gap-3 bg-white rounded-xl p-4 mb-3 shadow-sm"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-50">
              <Icon color="#4a7c32" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base">
                {title}
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                {description}
              </Text>
            </View>
            <Switch
              value={config[key]}
              onValueChange={(v) => toggle(key, v)}
              trackColor={{ false: "#D1D5DB", true: "#a3c78f" }}
              thumbColor={config[key] ? "#4a7c32" : "#F3F4F6"}
            />
          </TouchableOpacity>
        ))}

        {!user?.nucleo && (
          <Text className="text-gray-500 text-sm text-center mt-4">
            Seu usuário não tem núcleo — configurações indisponíveis.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
