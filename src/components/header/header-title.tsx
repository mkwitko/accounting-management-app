import { Text } from "react-native";

export default function HeaderTitle({ title }: { title: string }) {
  return <Text className="text-3xl font-bold text-white">{title}</Text>;
}
