import { Text, View } from "react-native";

interface StatusBadgeProps {
  isActive: boolean;
}

export default function StatusBadge({ isActive }: StatusBadgeProps) {
  return (
    <View
      className={`px-3 py-1.5 rounded-full ${
        isActive ? "bg-green-100" : "bg-gray-100"
      }`}
    >
      <View className="flex-row items-center">
        <View
          className={`w-2 h-2 rounded-full ${
            isActive ? "bg-green-500" : "bg-gray-400"
          } mr-1.5`}
        />
        <Text
          className={`${
            isActive ? "text-green-700" : "text-gray-600"
          } text-xs font-semibold`}
        >
          {isActive ? "Ativo" : "Inativo"}
        </Text>
      </View>
    </View>
  );
}
