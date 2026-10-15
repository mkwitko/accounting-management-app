import { useAuthContext } from "@/src/context/auth-context";
import { queryClient } from "@/src/lib/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function PendingPage() {
  const { user, logout, loggingOut } = useAuthContext();
  const [checking, setChecking] = useState(false);

  async function handleRecheck() {
    setChecking(true);
    await queryClient.invalidateQueries();
    setChecking(false);
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 40,
        justifyContent: "center",
      }}
    >
      <View className="gap-8">
        <View className="items-center gap-4">
          <Image
            alt="Logo da aplicação"
            source={require("@/assets/images/logo.png")}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
          <Text className="text-zinc-800 text-2xl font-bold">
            Acesso pendente
          </Text>
        </View>

        <View className="w-full bg-white rounded-3xl p-6 gap-4 border border-zinc-200">
          <View className="gap-1">
            <Text className="text-zinc-800 text-lg font-semibold">
              {user?.nome}
            </Text>
            <Text className="text-zinc-600 text-sm">{user?.email}</Text>
            <Text className="text-zinc-600 text-sm">
              Núcleo: {user?.nucleo?.nome ?? "—"}
            </Text>
          </View>

          <Text className="text-zinc-700 text-base">
            Sua conta ainda não tem cargo com permissão de acesso. Procure a
            direção do seu núcleo.
          </Text>

          <Text className="text-zinc-500 text-sm">
            Se o seu cargo acabou de ser cadastrado no Mural Digital, saia e
            entre novamente para atualizar.
          </Text>

          <Pressable
            onPress={handleRecheck}
            disabled={checking}
            accessibilityRole="button"
            accessibilityLabel="Verificar novamente"
          >
            {({ pressed }) => (
              <View
                className={`bg-primary h-14 rounded-xl flex items-center justify-center flex-row gap-2 ${
                  pressed ? "opacity-90" : "opacity-100"
                } ${checking ? "opacity-70" : ""}`}
              >
                {checking && <ActivityIndicator color="white" size="small" />}
                <Text className="text-lg font-bold text-white">
                  {checking ? "Verificando..." : "Verificar novamente"}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={logout}
            disabled={loggingOut}
            accessibilityRole="button"
            accessibilityLabel="Sair"
          >
            <View className="h-14 rounded-xl border border-zinc-300 flex items-center justify-center">
              <Text className="text-lg font-bold text-zinc-700">
                {loggingOut ? "Saindo..." : "Sair"}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
