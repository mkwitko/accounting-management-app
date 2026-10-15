import CustomPicker from "@/src/components/custom-picker";
import { useAuthContext } from "@/src/context/auth-context";
import { useFindMe } from "@/src/http/generated/user/user";
import {
  type SessaoFormData,
  sessaoFormSchema,
  sessaoOptions,
} from "@/src/pages/sessoes/sessao-types";
import { VegetalConsumoPicker } from "@/src/pages/sessoes/vegetal-consumo-picker";
import { COLORS } from "@/src/styles/colors";
import { formatDecimalInput, formatIntegerInput } from "@/src/utils/input-mask";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SessaoFormProps {
  onSubmit: (data: SessaoFormData) => Promise<void>;
  isSubmitting: boolean;
  initialValues?: Partial<SessaoFormData>;
  onCancel: () => void;
}

export function SessaoForm({
  onSubmit,
  isSubmitting,
  initialValues,
  onCancel,
}: SessaoFormProps) {
  const { data: user } = useFindMe();
  const { features } = useAuthContext();
  const estoqueAtivo = features.estoque;
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SessaoFormData>({
    resolver: zodResolver(sessaoFormSchema),
    defaultValues: {
      sessao: initialValues?.sessao || "",
      pessoas: initialValues?.pessoas || "",
      quantidadeVegetal: initialValues?.quantidadeVegetal || "",
      descricao: initialValues?.descricao || "",
      data: initialValues?.data || new Date(),
      nucleoId: initialValues?.nucleoId || user?.nucleo?.id || "",
      vegetais: initialValues?.vegetais || [],
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        sessao: initialValues.sessao || "",
        pessoas: initialValues.pessoas || "",
        quantidadeVegetal: initialValues.quantidadeVegetal || "",
        descricao: initialValues.descricao || "",
        data: initialValues.data || new Date(),
        nucleoId: initialValues.nucleoId || user?.nucleo?.id || "",
        vegetais: initialValues.vegetais || [],
      });
    }
  }, [initialValues, reset, user]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View className="flex-1 w-full web:max-w-2xl web:self-center">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Tipo de Sessão */}
        <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Tipo de Sessão *
        </Text>
        <Controller
          control={control}
          rules={{ required: "Tipo de sessão é obrigatório" }}
          name="sessao"
          render={({ field: { onChange, value } }) => (
            <View className="border border-gray-300 rounded-lg overflow-hidden">
              <CustomPicker
                options={sessaoOptions}
                selectedValue={value}
                onValueChange={onChange}
              />
            </View>
          )}
        />
        {errors.sessao && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.sessao.message}
          </Text>
        )}
      </View>

      {/* Pessoas */}
      <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Número de Pessoas *
        </Text>
        <Controller
          control={control}
          name="pessoas"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={(text) => {
                onChange(formatIntegerInput(text));
              }}
              onBlur={onBlur}
              placeholder="Ex: 25"
              keyboardType="numeric"
              className={`border ${
                errors.pessoas ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-3 bg-gray-50 text-base`}
              placeholderTextColor="#9CA3AF"
            />
          )}
        />
        {errors.pessoas && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.pessoas.message}
          </Text>
        )}
      </View>

      {/* Estoque ON: detalha por vegetal (desconta estoque). OFF: só quantidade total. */}
      {estoqueAtivo ? (
        <View className="mb-5">
          <Text className="text-gray-700 font-semibold mb-3 text-base">
            Vegetal Consumido *
          </Text>
          <Controller
            control={control}
            name="vegetais"
            render={({ field: { onChange, value } }) => (
              <VegetalConsumoPicker value={value || []} onChange={onChange} />
            )}
          />
          {errors.quantidadeVegetal && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.quantidadeVegetal.message}
            </Text>
          )}
        </View>
      ) : (
        <View className="mb-5">
          <Text className="text-gray-700 font-semibold mb-2 text-base">
            Quantidade Vegetal (L) *
          </Text>
          <Controller
            control={control}
            name="quantidadeVegetal"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={(text) => onChange(formatDecimalInput(text))}
                onBlur={onBlur}
                placeholder="Ex: 5,50"
                keyboardType="numeric"
                className={`border ${
                  errors.quantidadeVegetal
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg px-4 py-3 bg-gray-50 text-base`}
                placeholderTextColor="#9CA3AF"
              />
            )}
          />
          {errors.quantidadeVegetal && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.quantidadeVegetal.message}
            </Text>
          )}
        </View>
      )}

      <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Data da Sessão *
        </Text>
        <Controller
          control={control}
          name="data"
          render={({ field: { onChange, value } }) => {
            const [textValue, setTextValue] = useState(formatDate(value));

            // Atualiza TextInput quando value muda
            useEffect(() => {
              setTextValue(formatDate(value));
            }, [value]);

            // Converte dd/mm/aaaa para Date
            const parseDate = (text: string) => {
              const [day, month, year] = text.split("/").map(Number);
              if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                return new Date(year, month - 1, day);
              }
              return value; // fallback
            };

            return (
              <View className="relative">
                <TextInput
                  value={textValue}
                  onChangeText={(text) => {
                    // Remove qualquer caractere que não seja número
                    let cleaned = text.replace(/\D/g, "");

                    // Limita a 8 dígitos (ddmmyyyy)
                    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

                    // Adiciona as barras automaticamente
                    let formatted = cleaned;
                    if (cleaned.length >= 3 && cleaned.length <= 4) {
                      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
                    } else if (cleaned.length > 4) {
                      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(
                        2,
                        4
                      )}/${cleaned.slice(4)}`;
                    }

                    setTextValue(formatted);

                    if (cleaned.length === 8) {
                      const day = Number(cleaned.slice(0, 2));
                      const month = Number(cleaned.slice(2, 4));
                      const year = Number(cleaned.slice(4, 8));
                      const date = new Date(year, month - 1, day);
                      if (!isNaN(date.getTime())) {
                        onChange(date);
                      }
                    }
                  }}
                  onBlur={() => {
                    const parsed = parseDate(textValue);
                    onChange(parsed);
                    setTextValue(formatDate(parsed));
                  }}
                  placeholder="dd/mm/aaaa"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-base"
                  placeholderTextColor="#9CA3AF"
                />

                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="absolute right-3 top-3"
                  activeOpacity={0.7}
                >
                  <Calendar color={COLORS.primary.DEFAULT} size={20} />
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={value}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(Platform.OS === "ios");
                      if (selectedDate) {
                        onChange(selectedDate);
                        setTextValue(formatDate(selectedDate));
                      }
                    }}
                  />
                )}
              </View>
            );
          }}
        />
      </View>

      {/* Descrição */}
      <View className="mb-6">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Descrição (Opcional)
        </Text>
        <Controller
          control={control}
          name="descricao"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Observações sobre a sessão..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-base"
              placeholderTextColor="#9CA3AF"
            />
          )}
        />
      </View>

      </ScrollView>

      {/* Footer sticky */}
      <View className="flex-row gap-3 border-t border-gray-100 bg-white px-4 py-3">
        <TouchableOpacity
          onPress={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gray-200 rounded-lg py-4 items-center active:bg-gray-300"
          activeOpacity={0.8}
        >
          <Text className="text-gray-700 font-semibold text-base">
            Cancelar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={`flex-1 rounded-lg py-4 items-center ${
            isSubmitting
              ? "bg-primary-400"
              : "bg-primary-600 active:bg-primary-700"
          }`}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">Salvar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
