import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useFindMe } from "@/src/http/generated/user/user";
import { PreparoInfoData, preparoInfoSchema } from "../schema/preparo-schema";
import { COLORS } from "@/src/styles/colors";
import { formatDecimalInput } from "@/src/utils/input-mask";

interface PreparoInfoStepProps {
  onComplete: (data: PreparoInfoData) => void;
  initialData?: PreparoInfoData;
  isSubmitting: boolean;
}

export function PreparoInfoStep({
  onComplete,
  initialData,
  isSubmitting,
}: PreparoInfoStepProps) {
  const { data: user } = useFindMe();
  const [showInicioDatePicker, setShowInicioDatePicker] = useState(false);
  const [showFimDatePicker, setShowFimDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PreparoInfoData>({
    resolver: zodResolver(preparoInfoSchema),
    defaultValues: {
      inicio: initialData?.inicio || new Date(),
      fim: initialData?.fim || new Date(),
      producaoLitros: initialData?.producaoLitros || "",
      nucleoId: initialData?.nucleoId || user?.nucleo?.id || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        Informações do Preparo
      </Text>
      <Text className="text-gray-600 mb-6">
        Finalize com as informações gerais
      </Text>

      <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Data Início *
        </Text>
        <Controller
          control={control}
          name="inicio"
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
                  onPress={() => setShowInicioDatePicker(true)}
                  className="absolute right-3 top-3"
                  activeOpacity={0.7}
                >
                  <Calendar color={COLORS.primary.DEFAULT} size={20} />
                </TouchableOpacity>

                {showInicioDatePicker && (
                  <DateTimePicker
                    value={value}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                      setShowInicioDatePicker(Platform.OS === "ios");
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

      <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Data Conclusão *
        </Text>
        <Controller
          control={control}
          name="fim"
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
                  onPress={() => setShowFimDatePicker(true)}
                  className="absolute right-3 top-3"
                  activeOpacity={0.7}
                >
                  <Calendar color={COLORS.primary.DEFAULT} size={20} />
                </TouchableOpacity>

                {showFimDatePicker && (
                  <DateTimePicker
                    value={value}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                      setShowFimDatePicker(Platform.OS === "ios");
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

      {/* <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Data de Início *
        </Text>
        <Controller
          control={control}
          name="inicio"
          render={({ field: { onChange, value } }) => (
            <>
              <TouchableOpacity
                onPress={() => setShowInicioDatePicker(true)}
                className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 flex-row items-center justify-between"
                activeOpacity={0.7}
              >
                <Text className="text-gray-900 text-base">
                  {formatDate(value)}
                </Text>
                <Calendar color="#10B981" size={20} />
              </TouchableOpacity>
              {showInicioDatePicker && (
                <DateTimePicker
                  value={value}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowInicioDatePicker(Platform.OS === "ios");
                    if (selectedDate) {
                      onChange(selectedDate);
                    }
                  }}
                />
              )}
            </>
          )}
        />
      </View>

      <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Data de Conclusão *
        </Text>
        <Controller
          control={control}
          name="fim"
          render={({ field: { onChange, value } }) => (
            <>
              <TouchableOpacity
                onPress={() => setShowFimDatePicker(true)}
                className={`border ${
                  errors.fim ? "border-red-500" : "border-gray-300"
                } rounded-lg px-4 py-3 bg-gray-50 flex-row items-center justify-between`}
                activeOpacity={0.7}
              >
                <Text className="text-gray-900 text-base">
                  {formatDate(value)}
                </Text>
                <Calendar color="#10B981" size={20} />
              </TouchableOpacity>
              {errors.fim && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.fim.message}
                </Text>
              )}
              {showFimDatePicker && (
                <DateTimePicker
                  value={value}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowFimDatePicker(Platform.OS === "ios");
                    if (selectedDate) {
                      onChange(selectedDate);
                    }
                  }}
                />
              )}
            </>
          )}
        />
      </View> */}

      <View className="mb-6">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Produção (Litros) *
        </Text>
        <Controller
          control={control}
          name="producaoLitros"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={(text) => {
                onChange(formatDecimalInput(text));
              }}
              onBlur={onBlur}
              placeholder="Ex: 25,50"
              keyboardType="numeric"
              className={`border ${
                errors.producaoLitros ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-3 bg-gray-50 text-base`}
              placeholderTextColor="#9CA3AF"
            />
          )}
        />
        {errors.producaoLitros && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.producaoLitros.message}
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
            <Text className="text-white font-semibold text-base">
              Finalizar
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
