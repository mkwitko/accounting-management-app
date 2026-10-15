import { Input } from "@/src/components/ui/input";
import { SecureInput } from "@/src/components/ui/secure-input";
import { useAuthContext } from "@/src/context/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { SplashScreen, useRouter } from "expo-router";
import { useEffect, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Pressable,
  Text,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSignIn } from "@/src/http/generated/authentication/authentication";
import {
  SignInFormSchema,
  signInFormSchema,
} from "@/src/schemas/sign-in-form-schema";
import * as SecureStore from "expo-secure-store";
import { queryClient } from "@/src/lib/react-query";
import { Toast } from "toastify-react-native";
import KeyboardSpacer from "@/src/components/keyboard-spacer";

export default function SignInPage() {
  const router = useRouter();
  const { isReady } = useAuthContext();
  const { mutateAsync: signIn } = useSignIn();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormSchema>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignIn = useCallback(
    async (data: SignInFormSchema) => {
      try {
        const res = await signIn({
          data: {
            email: data.email.toLowerCase().trim(),
            password: data.password,
          },
        });

        if (!res.accessToken || !res.refreshToken) {
          throw new Error("Credenciais inválidas");
        }

        await SecureStore.setItemAsync("accessToken", res.accessToken);
        await SecureStore.setItemAsync("refreshToken", res.refreshToken);
        await queryClient.invalidateQueries();
        router.replace("/authenticated");
      } catch (error: any) {
        // Cadastro existe mas falta confirmar o email: manda para a tela do código.
        const code = error?.code ?? error?.response?.data?.code;
        if (code === "EMAIL_NAO_CONFIRMADO") {
          router.replace({
            pathname: "/public/confirm",
            params: { email: data.email.toLowerCase().trim() },
          });
          return;
        }

        const errorMessage =
          error?.response?.data?.message ||
          error.message ||
          "Erro ao fazer login";
        Toast.error(errorMessage);
        console.error("Sign in error:", error);
      }
    },
    [signIn, router]
  );

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
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
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center gap-10">
          {/* Logo Section */}
          <View className="items-center gap-5">
            <View className="relative">
              {/* Subtle glow effect */}
              <View className="bg-primary rounded-3xl border border-primary/20">
                <Image
                  alt="Logo da aplicação"
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 180, height: 180 }}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View className="items-center gap-2">
              <Text className="text-zinc-800 text-3xl font-bold tracking-tight">
                Bem-vindo de volta
              </Text>
              <Text className="text-zinc-600 text-base text-center px-4 max-w-sm">
                Entre com suas credenciais para continuar
              </Text>
            </View>
          </View>

          {/* Form Section */}
          <View
            className="w-full bg-white rounded-3xl p-6 gap-5 border border-zinc-200"
          >
            {/* Email Field */}
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <View className="gap-2">
                  <Text className="text-zinc-700 font-semibold text-sm ml-1">
                    Email
                  </Text>
                  <View className="relative">
                    <Input
                      value={field.value}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      returnKeyType="next"
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="seu@email.com"
                      placeholderTextColor="#a1a1aa"
                      error={!!errors.email}
                      editable={!isSubmitting}
                    />
                  </View>
                  {errors.email?.message && (
                    <View className="flex-row items-center gap-1 ml-1">
                      <Text className="text-red-500 text-xs">
                        ⚠ {errors.email.message}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            />

            {/* Password Field */}
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <View className="gap-2">
                  <Text className="text-zinc-700 font-semibold text-sm ml-1">
                    Senha
                  </Text>
                  <View className="relative">
                    <SecureInput
                      value={field.value}
                      keyboardType="default"
                      autoCapitalize="none"
                      autoComplete="password"
                      autoCorrect={false}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="••••••••"
                      placeholderTextColor="#a1a1aa"
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(handleSignIn)}
                      error={!!errors.password}
                      editable={!isSubmitting}
                    />
                  </View>
                  {errors.password?.message && (
                    <View className="flex-row items-center gap-1 ml-1">
                      <Text className="text-red-500 text-xs">
                        ⚠ {errors.password.message}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            />

            {/* Sign In Button */}
            <Pressable
              onPress={handleSubmit(handleSignIn)}
              disabled={isSubmitting}
              className="mt-2"
              accessibilityRole="button"
              accessibilityLabel="Entrar na conta"
              accessibilityState={{ disabled: isSubmitting }}
            >
              {({ pressed }) => (
                <View
                  className={`bg-primary h-14 rounded-xl flex items-center justify-center flex-row gap-2 ${pressed ? "opacity-90" : "opacity-100"
                    } ${isSubmitting ? "opacity-70" : ""}`}
                >
                  {isSubmitting && (
                    <ActivityIndicator color="white" size="small" />
                  )}
                  <Text className="text-lg font-bold text-white">
                    {isSubmitting ? "Entrando..." : "Entrar"}
                  </Text>
                </View>
              )}
            </Pressable>

            <View className="gap-1 pt-2 border-t border-zinc-100">
              <Text className="text-zinc-700 text-sm text-center font-semibold">
                Use sua conta do Mural Digital para acessar.
              </Text>
              <Pressable
                onPress={() => router.push("/public/signup")}
                accessibilityRole="button"
                accessibilityLabel="Criar conta"
              >
                <Text className="text-zinc-600 text-sm text-center mt-2">
                  Não tem conta?{" "}
                  <Text className="font-bold text-primary">Criar conta</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <KeyboardSpacer />
    </View>
  );
}
