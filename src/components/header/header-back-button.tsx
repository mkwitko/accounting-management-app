import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface Props {
  onPress: () => void;
  label?: string;
}

export default function HeaderBackButton({ onPress, label = "Voltar" }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center"
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <ArrowLeft color="#FFFFFF" size={24} />
      {!!label && (
        <Text className="text-white ml-2 text-base font-medium">{label}</Text>
      )}
    </TouchableOpacity>
  );
}
