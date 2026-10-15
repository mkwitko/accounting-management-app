import DrawerContent from "@/src/components/header/drawer-content";
import { useAuthContext } from "@/src/context/auth-context";
import { Drawer } from "expo-router/drawer";
import {
  BookOpen,
  Crown,
  DotSquare,
  FileChartColumn,
  Leaf,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  View,
} from "react-native";

export default function TabsLayout() {
  const { isReady, features } = useAuthContext();
  const { width } = useWindowDimensions();

  // Web em tela larga: sidebar fixa (permanente) ao lado do conteúdo.
  const permanent = Platform.OS === "web" && width >= 1024;

  // Esconde do menu as abas de funcionalidades desativadas no núcleo.
  const hidden = { drawerItemStyle: { display: "none" as const } };

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F9FAFB",
        }}
      >
        <ActivityIndicator size="large" color="#4a7c32" />
      </View>
    );
  }

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: "#4a7c32",
        drawerInactiveTintColor: "#6B7280",
        drawerActiveBackgroundColor: "#f2f7ef",
        drawerType: permanent ? "permanent" : "front",
        drawerStyle: {
          backgroundColor: "#FFFFFF",
          width: 280,
        },
        drawerItemStyle: {
          borderRadius: 12,
          paddingVertical: 2,
        },
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: "600",
          marginLeft: -8,
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: "Sessões",
          title: "Sessões",
          drawerIcon: ({ color }) => <BookOpen color={color} size={22} />,
        }}
      />
      <Drawer.Screen
        name="preparo"
        options={{
          drawerLabel: "Preparos",
          title: "Preparos",
          drawerIcon: ({ color }) => <Crown color={color} size={22} />,
        }}
      />
      <Drawer.Screen
        name="estoque"
        options={{
          drawerLabel: "Estoque",
          title: "Estoque",
          drawerIcon: ({ color }) => <Leaf color={color} size={22} />,
          ...(features.estoque ? {} : hidden),
        }}
      />
      <Drawer.Screen
        name="relatorios"
        options={{
          drawerLabel: "Relatório",
          title: "Relatório",
          drawerIcon: ({ color }) => <FileChartColumn color={color} size={22} />,
        }}
      />
      <Drawer.Screen
        name="integrations"
        options={{
          drawerLabel: "Integrações",
          title: "Integrações",
          drawerIcon: ({ color }) => <DotSquare color={color} size={22} />,
          ...(features.integracoes ? {} : hidden),
        }}
      />
    </Drawer>
  );
}
