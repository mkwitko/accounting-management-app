import React from "react";
import { View } from "react-native";

export default function Header({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-primary shadow-lg">
      <View className="px-6 py-8">{children}</View>
    </View>
  );
}
