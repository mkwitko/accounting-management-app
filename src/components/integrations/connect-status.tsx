import { CheckCircle } from "lucide-react-native";
import { Text, View } from "react-native";

interface ConnectionStatusCardProps {
  userName: string;
  email?: string;
}

export default function ConnectionStatusCard({
  userName,
  email,
}: ConnectionStatusCardProps) {
  return (
    <View className="bg-primary-50 rounded-2xl p-4 shadow-sm border border-green-200">
      <View className="flex-row items-center">
        <View className="w-11 h-11 rounded-full bg-green-500 items-center justify-center mr-3 shadow-sm">
          <CheckCircle color="#FFFFFF" size={22} />
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
            Conectado como
          </Text>
          <Text className="text-gray-900 font-bold text-base mt-0.5">
            {userName}
          </Text>
        </View>
      </View>
    </View>
  );
}
