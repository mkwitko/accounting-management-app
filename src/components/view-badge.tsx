import { useAuthContext } from "@/src/context/auth-context";
import { PERMISSIONS_ENUM } from "@/src/@types/permissions";
import { useViewContext } from "@/src/context/view-context";
import { router } from "expo-router";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Globe,
  Home,
  MapPin,
  RotateCcw,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../styles/colors";

export function ViewBadge() {
  const {
    generalView,
    regionView,
    nucleoView,
    viewLabel,
    homeNucleoId,
    homeNucleoNome,
    isEnchanced,
    resetViews,
  } = useViewContext();
  const { userHasRole } = useAuthContext();

  // Colapsado por padrão — expande só quando o usuário quer alternar.
  const [expanded, setExpanded] = useState(false);

  // Só troca de escopo com permissão. Sem permissão → só o próprio núcleo.
  const canSwitchView = userHasRole([
    PERMISSIONS_ENUM.VER_NUCLEOS,
    PERMISSIONS_ENUM.VER_REGIOES,
  ]);

  // Sem permissão de trocar e já na visão base: nada a exibir.
  if (!canSwitchView && !isEnchanced) return null;

  const getViewConfig = () => {
    if (generalView) {
      return {
        label: "Visão Geral",
        description: "Dados consolidados de todas as regiões",
        icon: Globe,
      };
    }
    if (regionView) {
      return {
        label: viewLabel || "Visão Regional",
        description: "Visão regional",
        icon: MapPin,
      };
    }
    // Outro núcleo (não o que frequenta).
    if (nucleoView && nucleoView !== homeNucleoId) {
      return {
        label: viewLabel || "Visão por Núcleo",
        description: "Visão por núcleo",
        icon: Users,
      };
    }

    // Base: núcleo que o usuário frequenta.
    return {
      label: homeNucleoNome || "Meu núcleo",
      description: "Núcleo que você frequenta (visão padrão)",
      icon: Home,
    };
  };

  const config = getViewConfig();
  const Icon = config.icon;

  const handleRegionPicker = () => router.push("/authenticated/region-picker");

  // Chip fino (colapsado).
  if (!expanded) {
    return (
      <View>
        <TouchableOpacity
          onPress={() => setExpanded(true)}
          activeOpacity={0.85}
          className="flex-row items-center w-full bg-primary-50 border border-primary-200 rounded-full pl-3 pr-2.5 py-2.5"
        >
          <Icon color={COLORS.primary[600]} size={16} />
          <Text
            numberOfLines={1}
            className="flex-1 ml-2 text-primary-900 font-semibold text-xs"
          >
            {config.label}
          </Text>
          {isEnchanced && (
            <View className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2" />
          )}
          <ChevronDown color={COLORS.primary[600]} size={16} />
        </TouchableOpacity>
      </View>
    );
  }

  // Card completo (expandido).
  return (
    <View className="px-4 pt-3">
      <View className="border-l-4 border-primary-500 bg-primary-50 rounded-2xl shadow-sm p-4">
        {/* Header */}
        <TouchableOpacity
          onPress={() => setExpanded(false)}
          activeOpacity={0.85}
          className="flex-row items-center mb-3"
        >
          <View className="w-11 h-11 rounded-full bg-primary-500 items-center justify-center">
            <Icon color="white" size={20} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-bold text-primary-900">
              {config.label}
            </Text>
            <Text className="text-xs mt-1 text-primary-600">
              {config.description}
            </Text>
          </View>
          <ChevronUp color={COLORS.primary[600]} size={20} />
        </TouchableOpacity>

        {/* Botões */}
        <View className="flex-row items-center justify-between gap-3 mt-2">
          {isEnchanced && (
            <TouchableOpacity
              onPress={resetViews}
              activeOpacity={0.85}
              className="flex-row items-center bg-white/90 border border-gray-200 rounded-full px-3 py-2 shadow-sm"
            >
              <RotateCcw color={COLORS.primary[600]} size={16} />
              <Text className="ml-2 text-xs font-semibold text-gray-700">
                Voltar ao meu núcleo
              </Text>
            </TouchableOpacity>
          )}

          {canSwitchView && (
            <TouchableOpacity
              onPress={handleRegionPicker}
              activeOpacity={0.85}
              className={`flex-row items-center ${isEnchanced ? "px-3 py-2" : "flex-1 justify-center px-4 py-2.5"
                } bg-white border border-gray-200 rounded-full shadow-sm`}
            >
              <ArrowLeftRight color={COLORS.primary[600]} size={16} />
              <Text
                className={`ml-2 font-semibold text-gray-700 ${isEnchanced ? "text-xs" : "text-sm"
                  }`}
              >
                Alternar visualização
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
