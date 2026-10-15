import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LenhaData, lenhaSchema } from "../schema/preparo-schema";
import CustomPicker from "@/src/components/custom-picker";
import { useEffect } from "react";
import { formatDecimalInput } from "@/src/utils/input-mask";

interface LenhaStepProps {
  onComplete: (data: LenhaData) => void;
  initialData?: LenhaData;
  isSubmitting: boolean;
}

export function LenhaStep({
  onComplete,
  initialData,
  isSubmitting,
}: LenhaStepProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LenhaData>({
    resolver: zodResolver(lenhaSchema),
    defaultValues: {
      quantidadeM2: initialData?.quantidadeM2 || "",
      tempoFornalhaAcesa: initialData?.tempoFornalhaAcesa || "",
      tipoLenha: initialData?.tipoLenha || "",
      tipoFornalha: initialData?.tipoFornalha || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Text className="text-2xl font-bold text-gray-900 mb-2">Lenha</Text>
      <Text className="text-gray-600 mb-6">
        Informe os dados da lenha utilizada
      </Text>

      <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Quantidade (m²) *
        </Text>
        <Controller
          control={control}
          name="quantidadeM2"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={(text) => {
                onChange(formatDecimalInput(text));
              }}
              onBlur={onBlur}
              placeholder="Ex: 3,50"
              keyboardType="numeric"
              className={`border ${
                errors.quantidadeM2 ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-3 bg-gray-50 text-base`}
              placeholderTextColor="#9CA3AF"
            />
          )}
        />
        {errors.quantidadeM2 && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.quantidadeM2.message}
          </Text>
        )}
      </View>

      <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Tempo Fornalha Acesa (horas) *
        </Text>
        <Controller
          control={control}
          name="tempoFornalhaAcesa"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={(text) => {
                onChange(formatDecimalInput(text));
              }}
              onBlur={onBlur}
              placeholder="Ex: 8,00"
              keyboardType="numeric"
              className={`border ${
                errors.tempoFornalhaAcesa ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-3 bg-gray-50 text-base`}
              placeholderTextColor="#9CA3AF"
            />
          )}
        />
        {errors.tempoFornalhaAcesa && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.tempoFornalhaAcesa.message}
          </Text>
        )}
      </View>

      <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Tipo de Lenha *
        </Text>
        <Controller
          control={control}
          name="tipoLenha"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ex: Eucalipto, Pinus..."
              className={`border ${
                errors.tipoLenha ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-3 bg-gray-50 text-base`}
              placeholderTextColor="#9CA3AF"
            />
          )}
        />
        {errors.tipoLenha && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.tipoLenha.message}
          </Text>
        )}
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Tipo de Fornalha *
        </Text>
        <Controller
          control={control}
          name="tipoFornalha"
          render={({ field: { onChange, value } }) => (
            <CustomPicker
              options={[
                {
                  value: "caldeira",
                  label: "Caldeira",
                },
                {
                  value: "convencional",
                  label: "Convencional",
                },
                {
                  value: "mono-camara",
                  label: "Mono-câmara",
                },
                {
                  value: "rocket-stove",
                  label: "Turbilhonamento (Rocket Stove)",
                },
                {
                  value: "outros",
                  label: "Outros",
                },
              ]}
              selectedValue={value}
              onValueChange={onChange}
            />
          )}
        />
        {errors.tipoFornalha && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.tipoFornalha.message}
          </Text>
        )}
      </View>

      </ScrollView>

      <View className="border-t border-gray-100 bg-white px-4 py-3">
        <TouchableOpacity
          onPress={handleSubmit(onComplete)}
          disabled={isSubmitting}
          className={`rounded-lg py-4 items-center ${
            isSubmitting
              ? "bg-primary-400"
              : "bg-primary-600 active:bg-primary-700"
          }`}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">Próximo</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
