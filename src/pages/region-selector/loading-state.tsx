import { ActivityIndicator, Text, View } from "react-native";

interface LoadingStateProps {
  message: string;
}

export default function LoadingState({ message }: LoadingStateProps) {
  return (
    <View className="bg-white rounded-2xl p-10 items-center shadow-sm">
      <ActivityIndicator color="#16A34A" size="large" />
      <Text className="text-gray-500 mt-4 text-base font-medium">
        {message}
      </Text>
    </View>
  );
}
