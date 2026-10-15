import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { Menu } from "lucide-react-native";
import React from "react";
import { Platform, TouchableOpacity, useWindowDimensions } from "react-native";

export default function DrawerMenuButton() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  // Sidebar é permanente no web largo — não precisa do hamburger.
  if (Platform.OS === "web" && width >= 1024) return null;

  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      activeOpacity={0.7}
      className="mr-4"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Menu color="#FFFFFF" size={28} />
    </TouchableOpacity>
  );
}
