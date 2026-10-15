import { Text, View } from "react-native";

interface StatsCardProps {
  totalNucleos: number;
  totalRegioes: number;
}

export default function StatsCard({
  totalNucleos,
  totalRegioes,
}: StatsCardProps) {
  return (
    <View className="bg-primary-600 rounded-3xl p-6 shadow-lg">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-2">
            Estatísticas Gerais
          </Text>
          <Text className="text-white text-3xl font-bold mb-1">
            {totalNucleos}
          </Text>
          <Text className="text-white/90 text-sm font-medium">
            Núcleos ativos
          </Text>
        </View>
        <View className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
          <Text className="text-white text-2xl font-bold mb-0.5">
            {totalRegioes}
          </Text>
          <Text className="text-white/90 text-xs font-semibold">Regiões</Text>
        </View>
      </View>
    </View>
  );
}
