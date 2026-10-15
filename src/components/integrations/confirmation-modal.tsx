import { AlertTriangle, LogOut } from "lucide-react-native";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  isLoading?: boolean;
  loadingText?: string;
  variant?: "warning" | "danger";
}

export default function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = "Cancelar",
  isLoading = false,
  loadingText = "Processando...",
  variant = "warning",
}: ConfirmationModalProps) {
  const iconColor = variant === "danger" ? "#DC2626" : "#F59E0B";
  const iconBgColor = variant === "danger" ? "bg-red-100" : "bg-amber-100";
  const buttonColor = variant === "danger" ? "bg-red-600" : "bg-primary-600";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
          <View className="p-6">
            {/* Icon */}
            <View
              className={`w-16 h-16 rounded-full ${iconBgColor} items-center justify-center mx-auto mb-4`}
            >
              {variant === "danger" ? (
                <LogOut color={iconColor} size={32} />
              ) : (
                <AlertTriangle color={iconColor} size={32} />
              )}
            </View>

            {/* Title */}
            <Text className="text-gray-900 font-bold text-xl text-center mb-2">
              {title}
            </Text>

            {/* Description */}
            <Text className="text-gray-600 text-sm text-center leading-relaxed mb-6">
              {description}
            </Text>

            {/* Buttons */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={onConfirm}
                disabled={isLoading}
                className={`${buttonColor} rounded-xl py-4 shadow-lg`}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text className="text-white font-bold text-base ml-2">
                      {loadingText}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-bold text-base text-center">
                    {confirmText}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                disabled={isLoading}
                className="bg-gray-100 rounded-xl py-4"
                activeOpacity={0.8}
              >
                <Text className="text-gray-700 font-semibold text-base text-center">
                  {cancelText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
