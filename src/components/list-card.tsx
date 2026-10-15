import { ChevronRight } from "lucide-react-native";
import React from "react";
import { View, Text, Pressable } from "react-native";

export function ListCard({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-4 active:opacity-80"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4 flex-1">
          <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center">
            {icon}
          </View>

          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {title}
            </Text>

            {subtitle && (
              <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
            )}
          </View>
        </View>

        <ChevronRight size={18} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}
