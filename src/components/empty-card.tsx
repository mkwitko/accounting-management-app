import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";

// Componente Empty State
export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) {
  return (
    <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <View className="items-center mb-4">
        <View className="bg-primary/10 rounded-full p-4 mb-3">
          <Icon color="#16a34a" size={32} />
        </View>
        <Text className="text-gray-900 text-lg font-bold text-center mb-2">
          {title}
        </Text>
        <Text className="text-gray-600 text-sm text-center leading-5">
          {description}
        </Text>
      </View>

      {actionText && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="bg-primary rounded-xl p-4 flex-row items-center justify-center gap-2"
          activeOpacity={0.8}
        >
          <Plus color="#FFF" size={20} />
          <Text className="text-white font-bold text-base">{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
