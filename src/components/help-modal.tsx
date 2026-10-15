import { HelpCircle, X } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface HelpModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function HelpModal({
  visible,
  title,
  message,
  onClose,
}: HelpModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 bg-black/50 items-center justify-center px-6"
        onPress={onClose}
      >
        <Pressable className="w-full max-w-md bg-white rounded-2xl p-5">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-50">
              <HelpCircle color="#4a7c32" size={20} />
            </View>
            <Text className="flex-1 text-lg font-bold text-gray-900">
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.6}
            >
              <X color="#9CA3AF" size={22} />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-600 text-sm leading-5">{message}</Text>

          <TouchableOpacity
            onPress={onClose}
            className="mt-5 bg-primary-600 rounded-lg py-3 items-center active:bg-primary-700"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">Entendi</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
