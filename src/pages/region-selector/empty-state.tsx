import { Text, View } from "react-native";

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <View className="bg-white rounded-2xl p-10 items-center shadow-sm">
      <Text className="text-gray-400 text-base font-medium text-center">
        {message}
      </Text>
    </View>
  );
}
