import KeyboardSpacer from "@/src/components/keyboard-spacer";
import { Input } from "@/src/components/ui/input";
import {
  useConfirmSignUp,
  useResendConfirmation,
} from "@/src/http/generated/authentication/authentication";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";

export default function ConfirmPage() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [codigo, setCodigo] = useState("");

  const { mutateAsync: confirmSignUp, isPending: confirming } =
    useConfirmSignUp();
  const { mutateAsync: resend, isPending: resending } = useResendConfirmation();

  // Rota acessada sem o param (deep link, navegação manual): não há email para
  // confirmar, então volta para o login em vez de mostrar uma tela quebrada.
  useEffect(() => {
    if (!email) {
      router.replace("/public/signin");
    }
  }, [email, router]);

  async function handleConfirm() {
    try {
      await confirmSignUp({ data: { email, codigo: codigo.trim() } });
      Toast.success("Email confirmado, entre com sua senha");
      router.replace("/public/signin");
    } catch (error: any) {
      Toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Código inválido ou expirado",
      );
    }
  }

  async function handleResend() {
    try {
      await resend({ data: { email } });
      Toast.success("Código reenviado");
    } catch (error: any) {
      Toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível reenviar",
      );
    }
  }

  if (!email) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-100">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-100">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center gap-8">
          <View className="items-center gap-2">
            <Text className="text-zinc-800 text-3xl font-bold tracking-tight">
              Confirme seu email
            </Text>
            <Text className="text-zinc-600 text-base text-center px-4">
              Enviamos um código para {email}.
            </Text>
          </View>

          <View className="w-full bg-white rounded-3xl p-6 gap-5 border border-zinc-200">
            <View className="gap-2">
              <Text className="text-zinc-700 font-semibold text-sm ml-1">
                Código
              </Text>
              <Input
                value={codigo}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setCodigo}
                placeholder="000000"
                placeholderTextColor="#a1a1aa"
                editable={!confirming}
                returnKeyType="done"
                onSubmitEditing={handleConfirm}
              />
            </View>

            <Pressable
              onPress={handleConfirm}
              disabled={confirming || codigo.trim().length === 0}
              accessibilityRole="button"
              accessibilityLabel="Confirmar email"
            >
              {({ pressed }) => (
                <View
                  className={`bg-primary h-14 rounded-xl flex items-center justify-center flex-row gap-2 ${
                    pressed ? "opacity-90" : "opacity-100"
                  } ${confirming ? "opacity-70" : ""}`}
                >
                  {confirming && <ActivityIndicator color="white" size="small" />}
                  <Text className="text-lg font-bold text-white">
                    {confirming ? "Confirmando..." : "Confirmar"}
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable onPress={handleResend} disabled={resending}>
              <Text className="text-center text-zinc-600 text-sm">
                {resending ? "Reenviando..." : "Reenviar código"}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.replace("/public/signin")}>
              <Text className="text-center text-zinc-600 text-sm">
                Voltar para <Text className="font-bold">Entrar</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <KeyboardSpacer />
    </View>
  );
}
