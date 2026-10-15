import { useAuthContext } from "@/src/context/auth-context";
import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { AlertModal } from "@/src/pages/sessoes/alert-modal";
import { useRouter } from "expo-router";
import { LogOut, Settings } from "lucide-react-native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function DrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  return (
    <View className="flex-1 bg-white">
      {/* Perfil */}
      <View className="bg-primary px-5 pt-14 pb-6">
        <View className="flex-row items-center gap-3">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <Text className="text-xl font-bold text-white">
              {initials(user?.nome)}
            </Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-lg font-bold text-white"
              numberOfLines={1}
            >
              {user?.nome ?? "Usuário"}
            </Text>
            {!!user?.cargoNome && (
              <Text
                className="text-primary-100 text-sm"
                numberOfLines={1}
              >
                {user.cargoNome}
              </Text>
            )}
            {!!user?.nucleo?.nome && (
              <Text
                className="text-primary-100/80 text-xs mt-0.5"
                numberOfLines={1}
              >
                {user.nucleo.nome}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Navegação */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 12 }}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Rodapé - Configurações + Sair */}
      <View className="border-t border-gray-100 px-3 py-3">
        <TouchableOpacity
          onPress={() => {
            props.navigation.closeDrawer();
            router.push("/authenticated/settings");
          }}
          activeOpacity={0.7}
          className="flex-row items-center gap-3 rounded-xl px-4 py-3"
        >
          <Settings color="#4a7c32" size={22} />
          <Text className="text-base font-semibold text-gray-700">
            Configurações
          </Text>
        </TouchableOpacity>

        {/* Separador para afastar do Sair */}
        <View className="my-2 h-px bg-gray-100" />

        <TouchableOpacity
          onPress={() => setShowLogoutAlert(true)}
          activeOpacity={0.7}
          className="flex-row items-center gap-3 rounded-xl bg-red-50 px-4 py-3"
        >
          <LogOut color="#DC2626" size={22} />
          <Text className="text-base font-semibold text-red-600">Sair</Text>
        </TouchableOpacity>
      </View>

      <AlertModal
        visible={showLogoutAlert}
        config={{
          type: "warning",
          title: "Sair da conta?",
          message: "Tem certeza que deseja sair?",
          showCancel: true,
          confirmText: "Sim, sair",
          cancelText: "Cancelar",
          onConfirm: () => {
            setShowLogoutAlert(false);
            logout();
          },
          onCancel: () => setShowLogoutAlert(false),
        }}
        onClose={() => setShowLogoutAlert(false)}
      />
    </View>
  );
}
