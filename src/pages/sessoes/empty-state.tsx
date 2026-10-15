import { View, Text } from "react-native";
import { Package } from "lucide-react-native";

interface EmptyStateProps {
  hasSearchTerm: boolean;
  notFoundText: string;
  addText: string;
}

export function EmptyState({
  hasSearchTerm,
  notFoundText,
  addText,
}: EmptyStateProps) {
  return (
    <View className="py-16 px-6 items-center">
      <View className="bg-gray-100 rounded-full p-6 mb-4">
        <Package color="#9CA3AF" size={48} />
      </View>
      <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
        {hasSearchTerm ? "Nenhum resultado encontrado" : notFoundText}
      </Text>
      <Text className="text-gray-600 text-center">
        {hasSearchTerm ? "Tente ajustar sua pesquisa" : addText}
      </Text>
    </View>
  );
}
