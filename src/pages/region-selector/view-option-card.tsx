import { ChevronRight } from "lucide-react-native";
import type React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ViewOptionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  iconBackgroundColor: string;
}

export default function ViewOptionCard({
  icon,
  title,
  description,
  onPress,
  iconBackgroundColor,
}: ViewOptionCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm active:scale-[0.98]"
      activeOpacity={0.9}
    >
      <View className="flex-row items-center">
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center mr-4 shadow-md"
          style={{ backgroundColor: iconBackgroundColor }}
        >
          {icon}
        </View>
        <View className="flex-1 pr-2">
          <Text className="text-gray-900 font-bold text-lg mb-1">{title}</Text>
          <Text className="text-gray-500 text-sm font-medium leading-5">
            {description}
          </Text>
        </View>
        <ChevronRight color="#9CA3AF" size={24} strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
}
