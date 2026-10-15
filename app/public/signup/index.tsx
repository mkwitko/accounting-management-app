import KeyboardSpacer from "@/src/components/keyboard-spacer";
import CustomPicker from "@/src/components/custom-picker";
import { Input } from "@/src/components/ui/input";
import { SecureInput } from "@/src/components/ui/secure-input";
import { useSignUp } from "@/src/http/generated/authentication/authentication";
import { useGetPublicNucleos } from "@/src/http/generated/nucleos/nucleos";
import {
  SignUpFormSchema,
  signUpFormSchema,
} from "@/src/schemas/sign-up-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";

export default function SignUpPage() {
  const router = useRouter();
  const { mutateAsync: signUp } = useSignUp();
  const { data: nucleos, isLoading: loadingNucleos } = useGetPublicNucleos();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      nucleoId: "",
    },
  });

  const nucleoOptions = (nucleos ?? []).map((n) => ({
    label: n.regiaoNome ? `${n.nome} — ${n.regiaoNome}` : n.nome,
    value: n.id,
  }));

  const handleSignUp = useCallback(
    async (data: SignUpFormSchema) => {
      try {
        const res = await signUp({
          data: {
            nome: data.nome.trim(),
            email: data.email.toLowerCase().trim(),
            senha: data.senha,
            confirmarSenha: data.confirmarSenha,
            nucleoId: data.nucleoId,
          },
        });

        if (res.userConfirmed) {
          Toast.success("Cadastro criado, entre com sua senha");
          router.replace("/public/signin");
          return;
        }

        router.replace({
          pathname: "/public/confirm",
          params: { email: data.email.toLowerCase().trim() },
        });
      } catch (error: any) {
        Toast.error(
          error?.response?.data?.message ||
          error.message ||
          "Erro ao criar conta",
        );
      }
    },
    [signUp, router],
  );

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
        <View className="flex-1 justify-center gap-8">
          <View className="items-center gap-2">
            <Text className="text-zinc-800 text-3xl font-bold tracking-tight">
              Criar conta
            </Text>
            <Text className="text-zinc-600 text-base text-center px-4">
              Já usa o Mural Digital? Entre com aquela senha, sem criar conta. O
              acesso aos dados depende do seu cargo.
            </Text>
          </View>

          <View className="w-full bg-white rounded-3xl p-6 gap-5 border border-zinc-200">
            <Controller
              control={control}
              name="nome"
              render={({ field }) => (
                <View className="gap-2">
                  <Text className="text-zinc-700 font-semibold text-sm ml-1">
                    Nome completo
                  </Text>
                  <Input
                    value={field.value}
                    autoCapitalize="words"
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Seu nome"
                    placeholderTextColor="#a1a1aa"
                    error={!!errors.nome}
                    editable={!isSubmitting}
                  />
                  {errors.nome?.message && (
                    <Text className="text-red-500 text-xs ml-1">
                      ⚠ {errors.nome.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <View className="gap-2">
                  <Text className="text-zinc-700 font-semibold text-sm ml-1">
                    Email
                  </Text>
                  <Input
                    value={field.value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="seu@email.com"
                    placeholderTextColor="#a1a1aa"
                    error={!!errors.email}
                    editable={!isSubmitting}
                  />
                  {errors.email?.message && (
                    <Text className="text-red-500 text-xs ml-1">
                      ⚠ {errors.email.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="nucleoId"
              render={({ field }) => (
                <View className="gap-2">
                  <Text className="text-zinc-700 font-semibold text-sm ml-1">
                    Núcleo
                  </Text>
                  <CustomPicker
                    selectedValue={field.value}
                    onValueChange={field.onChange}
                    options={nucleoOptions}
                    placeholder={
                      loadingNucleos
                        ? "Carregando núcleos..."
                        : "Selecione seu núcleo"
                    }
                    disabled={loadingNucleos || isSubmitting}
                  />
                  {errors.nucleoId?.message && (
                    <Text className="text-red-500 text-xs ml-1">
                      ⚠ {errors.nucleoId.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="senha"
              render={({ field }) => (
                <View className="gap-2">
                  <Text className="text-zinc-700 font-semibold text-sm ml-1">
                    Senha
                  </Text>
                  <SecureInput
                    value={field.value}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="••••••••"
                    placeholderTextColor="#a1a1aa"
                    error={!!errors.senha}
                    editable={!isSubmitting}
                  />
                  {errors.senha?.message && (
                    <Text className="text-red-500 text-xs ml-1">
                      ⚠ {errors.senha.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="confirmarSenha"
              render={({ field }) => (
                <View className="gap-2">
                  <Text className="text-zinc-700 font-semibold text-sm ml-1">
                    Confirmar senha
                  </Text>
                  <SecureInput
                    value={field.value}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="••••••••"
                    placeholderTextColor="#a1a1aa"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(handleSignUp)}
                    error={!!errors.confirmarSenha}
                    editable={!isSubmitting}
                  />
                  {errors.confirmarSenha?.message && (
                    <Text className="text-red-500 text-xs ml-1">
                      ⚠ {errors.confirmarSenha.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Pressable
              onPress={handleSubmit(handleSignUp)}
              disabled={isSubmitting}
              className="mt-2"
              accessibilityRole="button"
              accessibilityLabel="Criar conta"
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
                    {isSubmitting ? "Criando..." : "Criar conta"}
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable onPress={() => router.replace("/public/signin")}>
              <Text className="text-center text-zinc-600 text-sm">
                Já tem conta? <Text className="font-bold">Entrar</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <KeyboardSpacer />
    </View>
  );
}
