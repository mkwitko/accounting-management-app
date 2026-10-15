import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, ChevronRight } from "lucide-react-native";
import { COLORS } from "@/src/styles/colors";

interface PeriodoPickerProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onApply: (dataInicio: Date, dataFim: Date) => void;
  dataInicio: Date;
  dataFim: Date;
}

export function PeriodoPicker({
  visible,
  setVisible,
  onApply,
  dataInicio,
  dataFim,
}: PeriodoPickerProps) {
  const formatDate = (date: Date) =>
    date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const [tempInicio, setTempInicio] = useState(dataInicio);
  const [tempFim, setTempFim] = useState(dataFim);
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFim, setShowPickerFim] = useState(false);
  const [inicioText, setInicioText] = useState(formatDate(dataInicio));
  const [fimText, setFimText] = useState(formatDate(dataFim));

  useEffect(() => {
    setTempInicio(dataInicio);
    setTempFim(dataFim);
    setInicioText(formatDate(dataInicio));
    setFimText(formatDate(dataFim));
  }, [dataInicio, dataFim]);

  const parseDate = (text: string) => {
    const [day, month, year] = text.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const handleTextChange = (text: string, type: "inicio" | "fim") => {
    // Limpa tudo que não é número
    let cleaned = text.replace(/\D/g, "").slice(0, 8);

    // Aplica máscara dd/mm/aaaa
    let formatted = cleaned;
    if (cleaned.length >= 3 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(
        2,
        4
      )}/${cleaned.slice(4)}`;
    }

    if (type === "inicio") setInicioText(formatted);
    else setFimText(formatted);
  };

  const handleBlur = (type: "inicio" | "fim") => {
    const text = type === "inicio" ? inicioText : fimText;
    const parsed = parseDate(text);
    if (type === "inicio") setTempInicio(parsed);
    else setTempFim(parsed);

    if (type === "inicio") setInicioText(formatDate(parsed));
    else setFimText(formatDate(parsed));
  };

  const handleAplicar = () => {
    onApply(tempInicio, tempFim);
    setVisible(false);
  };

  const handleCancelar = () => {
    setTempInicio(dataInicio);
    setTempFim(dataFim);
    setInicioText(formatDate(dataInicio));
    setFimText(formatDate(dataFim));
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="bg-white rounded-2xl p-4 border border-gray-100"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="bg-primary/10 p-2.5 rounded-xl">
              <Calendar color={COLORS.primary.DEFAULT} size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">
                Período
              </Text>
              <Text className="text-sm font-bold text-gray-900">
                {formatDate(dataInicio)} - {formatDate(dataFim)}
              </Text>
            </View>
          </View>
          <ChevronRight color="#9ca3af" size={20} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelar}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-5">
          <View className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="bg-primary/10 p-2.5 rounded-xl">
                <Calendar color={COLORS.primary.DEFAULT} size={22} />
              </View>
              <Text className="text-xl font-bold text-gray-900 flex-1">
                Selecionar Período
              </Text>
            </View>

            {/* Data Início */}
            <View>
              <Text className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Data Inicio
              </Text>
              <View className="relative">
                <TextInput
                  value={inicioText}
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

                    setInicioText(formatted);

                    const parsed = parseDate(formatted);
                    setTempInicio(parsed);
                  }}
                  onBlur={() => {
                    const parsed = parseDate(inicioText);
                    setTempInicio(parsed);
                    setInicioText(formatDate(parsed));
                  }}
                  placeholder="dd/mm/aaaa"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-base"
                  placeholderTextColor="#9CA3AF"
                />

                <TouchableOpacity
                  onPress={() => setShowPickerInicio(true)}
                  className="absolute right-3 top-3"
                  activeOpacity={0.7}
                >
                  <Calendar color={COLORS.primary.DEFAULT} size={20} />
                </TouchableOpacity>
              </View>

              {showPickerInicio && (
                <DateTimePicker
                  value={tempInicio}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowPickerInicio(Platform.OS === "ios");
                    if (selectedDate) {
                      setTempInicio(selectedDate);
                      setInicioText(formatDate(selectedDate));
                    }
                  }}
                />
              )}
            </View>

            <View className="mt-4">
              <Text className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Data Fim
              </Text>
              <View className="relative">
                <TextInput
                  value={fimText}
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
                    setFimText(formatted);

                    const parsed = parseDate(formatted);
                    setTempFim(parsed);
                  }}
                  onBlur={() => {
                    const parsed = parseDate(fimText);
                    setTempFim(parsed);
                    setFimText(formatDate(parsed));
                  }}
                  placeholder="dd/mm/aaaa"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-base"
                  placeholderTextColor="#9CA3AF"
                />

                <TouchableOpacity
                  onPress={() => setShowPickerFim(true)}
                  className="absolute right-3 top-3"
                  activeOpacity={0.7}
                >
                  <Calendar color={COLORS.primary.DEFAULT} size={20} />
                </TouchableOpacity>
              </View>

              {showPickerFim && (
                <DateTimePicker
                  value={tempFim}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowPickerFim(Platform.OS === "ios");
                    if (selectedDate) {
                      setTempFim(selectedDate);
                      setFimText(formatDate(selectedDate));
                    }
                  }}
                />
              )}
            </View>

            {/* Botões */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={handleCancelar}
                className="flex-1 bg-gray-100 rounded-xl p-4"
              >
                <Text className="text-gray-700 font-bold text-center text-base">
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAplicar}
                className="flex-1 bg-primary rounded-xl p-4"
              >
                <Text className="text-white font-bold text-center text-base">
                  Aplicar
                </Text>
              </TouchableOpacity>
            </View>

            {/* DatePickers */}
            {showPickerInicio && (
              <DateTimePicker
                value={tempInicio}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e, date) => {
                  setShowPickerInicio(Platform.OS === "ios");
                  if (date) {
                    setTempInicio(date);
                    setInicioText(formatDate(date));
                  }
                }}
              />
            )}

            {showPickerFim && (
              <DateTimePicker
                value={tempFim}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e, date) => {
                  setShowPickerFim(Platform.OS === "ios");
                  if (date) {
                    setTempFim(date);
                    setFimText(formatDate(date));
                  }
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
