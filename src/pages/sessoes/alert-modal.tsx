import { View, Text, TouchableOpacity, Modal } from "react-native";
import { AlertCircle, CheckCircle } from "lucide-react-native";
import { AlertConfig } from "./sessao-types";
import { COLORS } from "@/src/styles/colors";

interface AlertModalProps {
  visible: boolean;
  config: AlertConfig;
  onClose: () => void;
}

export function AlertModal({ visible, config, onClose }: AlertModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-2xl w-full max-w-md p-6">
          <View className="items-center mb-4">
            {config.type === "success" && (
              <View className="bg-primary-100 rounded-full p-3 mb-3">
                <CheckCircle color={COLORS.primary.DEFAULT} size={48} />
              </View>
            )}
            {config.type === "error" && (
              <View className="bg-red-100 rounded-full p-3 mb-3">
                <AlertCircle color="#EF4444" size={48} />
              </View>
            )}
            {config.type === "warning" && (
              <View className="bg-secondary-100 rounded-full p-3 mb-3">
                <AlertCircle color={COLORS.secondary.DEFAULT} size={48} />
              </View>
            )}
            <Text className="text-xl font-bold text-gray-900 text-center mb-2">
              {config.title}
            </Text>
            <Text className="text-gray-600 text-center">{config.message}</Text>
          </View>
          <View
            className={`flex-row gap-3 ${
              config.showCancel ? "" : "justify-center"
            }`}
          >
            {config.showCancel && (
              <TouchableOpacity
                onPress={config.onCancel || onClose}
                className="flex-1 bg-gray-200 py-3 px-6 rounded-lg"
              >
                <Text className="text-gray-800 font-semibold text-center">
                  {config.cancelText || "Cancelar"}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={config.onConfirm || onClose}
              className={`${config.showCancel ? "flex-1" : "px-8"} ${
                config.type === "warning" ? "bg-red-600" : "bg-primary"
              } py-3 px-6 rounded-lg`}
            >
              <Text className="text-white font-semibold text-center">
                {config.confirmText || (config.showCancel ? "Confirmar" : "OK")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
