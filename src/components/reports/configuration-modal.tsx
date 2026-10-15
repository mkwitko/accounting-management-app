import { useViewContext } from "@/src/context/view-context";
import { defaultConfigs } from "@/src/data/default-configs";
import { COLORS } from "@/src/styles/colors";
import { Settings } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ConfigurationModal({
  showModalConfigs,
  setShowModalConfigs,
}: {
  showModalConfigs: boolean;
  setShowModalConfigs: (value: boolean) => void;
}) {
  const { configs, setConfigs } = useViewContext();

  // Estado local para edição temporária
  const [localConfigs, setLocalConfigs] = useState(configs);

  // Sempre que abrir o modal, sincroniza com as configs atuais
  useEffect(() => {
    if (showModalConfigs) {
      setLocalConfigs(configs);
    }
  }, [showModalConfigs]);

  const handleChange = (key: string, text: string) => {
    setLocalConfigs({
      ...localConfigs,
      [key]: parseFloat(text) || 0,
    });
  };

  const handleConfirm = () => {
    setConfigs(localConfigs);
    setShowModalConfigs(false);
  };

  const handleReset = () => setLocalConfigs({ ...defaultConfigs });

  return (
    <Modal
      visible={showModalConfigs}
      transparent
      animationType="fade"
      onRequestClose={() => setShowModalConfigs(false)}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-5">
        <View className="bg-white rounded-3xl w-full max-w-md p-6 shadow-lg">
          <View className="flex-row items-center gap-2 mb-4">
            <Settings color={COLORS.primary.DEFAULT} size={24} />
            <Text className="text-xl font-bold text-gray-900">
              Configurações Avançadas
            </Text>
          </View>

          <ScrollView className="max-h-[400px]">
            {Object.entries(localConfigs).map(([key, value]) => (
              <View key={key} className="mb-4">
                <Text className="text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  {key.replace(/_/g, " ")}{" "}
                  {key === "CRESCIMENTO_ANUAL" ? "(%)" : ""}
                </Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(value)}
                  onChangeText={(text) => handleChange(key, text)}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3"
                />
              </View>
            ))}
          </ScrollView>

          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={handleReset}
              className="flex-1 bg-gray-100 rounded-xl p-4"
            >
              <Text className="text-gray-700 font-bold text-center text-base">
                Resetar Padrão
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              className="flex-1 bg-primary rounded-xl p-4"
            >
              <Text className="text-white font-bold text-center text-base">
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
