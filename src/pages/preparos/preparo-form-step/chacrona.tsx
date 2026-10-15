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
import { ChacronaData, chacronaSchema } from "../schema/preparo-schema";
import CustomPicker from "@/src/components/custom-picker";
import { useEffect } from "react";
import { formatDecimalInput, formatIntegerInput } from "@/src/utils/input-mask";

interface ChacronaStepProps {
  onComplete: (data: ChacronaData) => void;
  initialData?: ChacronaData;
  isSubmitting: boolean;
}

export function ChacronaStep({
  onComplete,
  initialData,
  isSubmitting,
}: ChacronaStepProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChacronaData>({
    resolver: zodResolver(chacronaSchema),
    defaultValues: {
      pesoKg: initialData?.pesoKg || "",
      unidades: initialData?.unidades || "",
      tipoPlantacao: initialData?.tipoPlantacao || "",
      origemMensagem: initialData?.origemMensagem || "",
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
      <Text className="text-2xl font-bold text-gray-900 mb-2">Chacrona</Text>
      <Text className="text-gray-600 mb-6">
        Informe os dados da chacrona utilizada
      </Text>

      <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Peso (Kg) *
        </Text>
        <Controller
          control={control}
          name="pesoKg"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={(text) => {
                onChange(formatDecimalInput(text));
              }}
              onBlur={onBlur}
              placeholder="Ex: 12,00"
              keyboardType="numeric"
              className={`border ${
                errors.pesoKg ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-3 bg-gray-50 text-base`}
              placeholderTextColor="#9CA3AF"
            />
          )}
        />
        {errors.pesoKg && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.pesoKg.message}
          </Text>
        )}
      </View>

      <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Unidades *
        </Text>
        <Controller
          control={control}
          name="unidades"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={(text) => {
                onChange(formatIntegerInput(text));
              }}
              onBlur={onBlur}
              placeholder="Ex: 100"
              keyboardType="numeric"
              className={`border ${
                errors.unidades ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-3 bg-gray-50 text-base`}
              placeholderTextColor="#9CA3AF"
            />
          )}
        />
        {errors.unidades && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.unidades.message}
          </Text>
        )}
      </View>

      <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Tipo de Plantação *
        </Text>
        <Controller
          control={control}
          name="tipoPlantacao"
          render={({ field: { onChange, value } }) => (
            <CustomPicker
              options={[
                {
                  value: "nativo",
                  label: "Nativo",
                },
                {
                  value: "plantado",
                  label: "Plantado",
                },
                {
                  value: "nativo e plantado",
                  label: "Nativo e Plantado",
                },
              ]}
              selectedValue={value}
              onValueChange={onChange}
            />
          )}
        />
        {errors.tipoPlantacao && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.tipoPlantacao.message}
          </Text>
        )}
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Origem/Mensagem *
        </Text>
        <Controller
          control={control}
          name="origemMensagem"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Local da colheita da chacrona"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className={`border ${
                errors.origemMensagem ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-3 bg-gray-50 text-base`}
              placeholderTextColor="#9CA3AF"
            />
          )}
        />
        {errors.origemMensagem && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.origemMensagem.message}
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
