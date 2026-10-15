import { COLORS } from "@/src/styles/colors";
import { View, Text } from "react-native";

export function MetricCard({ icon: Icon, title, value, subtitle }: any) {
  return (
    <View
      className="bg-white rounded-2xl p-4 border border-gray-100 w-[48%]"
    >
      <View className="flex-row items-center mb-2">
        <View className="bg-primary/10 p-2 rounded-xl mr-3">
          <Icon color={COLORS.primary.DEFAULT} size={20} />
        </View>
        <Text className="text-gray-600 font-semibold text-sm flex-1">
          {title}
        </Text>
      </View>

      <Text className="text-2xl font-bold text-gray-900 mb-1">{value}</Text>
      <Text className="text-xs text-gray-500">{subtitle}</Text>
    </View>
  );
}
