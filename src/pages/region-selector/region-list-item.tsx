import { ChevronRight } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface RegionListItemProps {
  nome: string;
  onPress: () => void;
}

export default function RegionListItem({ nome, onPress }: RegionListItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm active:bg-gray-50"
      activeOpacity={0.9}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-gray-900 font-bold text-lg mb-1">{nome}</Text>
        </View>
        <ChevronRight color="#9CA3AF" size={24} strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
}
