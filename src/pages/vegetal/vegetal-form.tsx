import CustomPicker from "@/src/components/custom-picker";
import {
  type VegetalFormData,
  tipoVegetalOptions,
  vegetalFormSchema,
} from "@/src/pages/vegetal/vegetal-types";
import { COLORS } from "@/src/styles/colors";
import { formatDecimalInput } from "@/src/utils/input-mask";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, X } from "lucide-react-native";
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

interface VegetalFormProps {
  onSubmit: (data: VegetalFormData) => Promise<void>;
  isSubmitting: boolean;
  initialValues?: Partial<VegetalFormData>;
  onCancel: () => void;
}

export function VegetalForm({
  onSubmit,
  isSubmitting,
  initialValues,
  onCancel,
}: VegetalFormProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VegetalFormData>({
    resolver: zodResolver(vegetalFormSchema),
    defaultValues: {
      nome: initialValues?.nome || "",
      tipo: (initialValues?.tipo as VegetalFormData["tipo"]) || "caupuri",
      dataPreparo: initialValues?.dataPreparo,
      mestrePreparo: initialValues?.mestrePreparo || "",
      observacoes: initialValues?.observacoes || "",
      litrosEstoque: initialValues?.litrosEstoque || "",
      litrosGeladeira: initialValues?.litrosGeladeira || "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        nome: initialValues.nome || "",
        tipo: (initialValues.tipo as VegetalFormData["tipo"]) || "caupuri",
        dataPreparo: initialValues.dataPreparo,
        mestrePreparo: initialValues.mestrePreparo || "",
        observacoes: initialValues.observacoes || "",
        litrosEstoque: initialValues.litrosEstoque || "",
        litrosGeladeira: initialValues.litrosGeladeira || "",
      });
    }
  }, [initialValues, reset]);

  const formatDate = (date?: Date) =>
    date
      ? date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

  return (
    <View className="flex-1 w-full web:max-w-2xl web:self-center">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Nome */}
        <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Nome *
        </Text>
        <Controller
          control={control}
          name="nome"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ex: Vegetal Preparo Março"
              className={`border ${
                errors.nome ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-3 bg-gray-50 text-base`}
              placeholderTextColor="#9CA3AF"
            />
          )}
        />
        {errors.nome && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.nome.message}
          </Text>
        )}
      </View>

      {/* Tipo */}
      <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Tipo *
        </Text>
        <Controller
          control={control}
          name="tipo"
          render={({ field: { onChange, value } }) => (
            <View className="border border-gray-300 rounded-lg overflow-hidden">
              <CustomPicker
                options={tipoVegetalOptions}
                selectedValue={value}
                onValueChange={onChange}
              />
            </View>
          )}
        />
        {errors.tipo && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.tipo.message}
          </Text>
        )}
      </View>

      {/* Data de Preparo */}
      <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Data do Preparo
        </Text>
        <Controller
          control={control}
          name="dataPreparo"
          render={({ field: { onChange, value } }) => {
            const [textValue, setTextValue] = useState(formatDate(value));

            useEffect(() => {
              setTextValue(formatDate(value));
            }, [value]);

            const parseDate = (text: string): Date | undefined => {
              // Campo vazio = data em branco (opcional).
              if (!text.trim()) return undefined;
              const [day, month, year] = text.split("/").map(Number);
              if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                return new Date(year, month - 1, day);
              }
              return value;
            };

            const clearDate = () => {
              onChange(undefined);
              setTextValue("");
            };

            return (
              <View className="relative">
                <TextInput
                  value={textValue}
                  onChangeText={(text) => {
                    let cleaned = text.replace(/\D/g, "");
                    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
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
                    // Apagou tudo → limpa a data.
                    if (cleaned.length === 0) {
                      onChange(undefined);
                    } else if (cleaned.length === 8) {
                      const d = Number(cleaned.slice(0, 2));
                      const m = Number(cleaned.slice(2, 4));
                      const y = Number(cleaned.slice(4, 8));
                      const date = new Date(y, m - 1, d);
                      if (!isNaN(date.getTime())) onChange(date);
                    }
                  }}
                  onBlur={() => {
                    const parsed = parseDate(textValue);
                    onChange(parsed);
                    setTextValue(formatDate(parsed));
                  }}
                  placeholder="dd/mm/aaaa (opcional)"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-4 py-3 pr-20 bg-gray-50 text-base"
                  placeholderTextColor="#9CA3AF"
                />
                {!!textValue && (
                  <TouchableOpacity
                    onPress={clearDate}
                    className="absolute right-11 top-3"
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X color="#9CA3AF" size={20} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="absolute right-3 top-3"
                  activeOpacity={0.7}
                >
                  <Calendar color={COLORS.primary.DEFAULT} size={20} />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={value ?? new Date()}
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

      {/* Mestre do Preparo */}
      <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Mestre do Preparo
        </Text>
        <Controller
          control={control}
          name="mestrePreparo"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Nome do mestre responsável"
              className={`border ${
                errors.mestrePreparo ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-3 bg-gray-50 text-base`}
              placeholderTextColor="#9CA3AF"
            />
          )}
        />
        {errors.mestrePreparo && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.mestrePreparo.message}
          </Text>
        )}
      </View>

      {/* Litros - Estoque + Geladeira */}
      <View className="flex-row gap-3 mb-5">
        <View className="flex-1">
          <Text className="text-gray-700 font-semibold mb-2 text-base">
            Estoque (L)
          </Text>
          <Controller
            control={control}
            name="litrosEstoque"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={(text) => onChange(formatDecimalInput(text))}
                onBlur={onBlur}
                placeholder="0,00"
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-base"
                placeholderTextColor="#9CA3AF"
              />
            )}
          />
        </View>
        <View className="flex-1">
          <Text className="text-gray-700 font-semibold mb-2 text-base">
            Geladeira (L)
          </Text>
          <Controller
            control={control}
            name="litrosGeladeira"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={(text) => onChange(formatDecimalInput(text))}
                onBlur={onBlur}
                placeholder="0,00"
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-base"
                placeholderTextColor="#9CA3AF"
              />
            )}
          />
        </View>
      </View>

      {/* Observações */}
      <View className="mb-6">
        <Text className="text-gray-700 font-semibold mb-2 text-base">
          Observações (Opcional)
        </Text>
        <Controller
          control={control}
          name="observacoes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Observações sobre o preparo..."
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
            isSubmitting ? "bg-primary-400" : "bg-primary-600 active:bg-primary-700"
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
