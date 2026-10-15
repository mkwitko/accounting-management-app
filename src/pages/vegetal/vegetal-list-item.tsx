import { useViewContext } from "@/src/context/view-context";
import type { GetVegetal200Item } from "@/src/http/generated/api.schemas";
import { COLORS } from "@/src/styles/colors";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  User,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { tipoVegetalLabel } from "./vegetal-types";

interface VegetalListItemProps {
  vegetal: GetVegetal200Item;
  onEdit: (vegetal: GetVegetal200Item) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  isLast: boolean;
}

export function VegetalListItem({
  vegetal,
  onEdit,
  onDelete,
  isDeleting,
  isLast,
}: VegetalListItemProps) {
  const { isEnchanced } = useViewContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const nucleoName = vegetal.Nucleos?.nome || "Núcleo desconhecido";
  const regiaoName = vegetal.Nucleos?.regioes?.nome || "Região desconhecida";

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View className={`bg-white ${!isLast ? "border-b border-gray-100" : ""}`}>
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        className="px-4 py-4 active:bg-gray-50"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 gap-2">
            <View className="flex-row items-center gap-3 flex-wrap">
              <View className="bg-primary py-1.5 px-3 rounded-lg">
                <Text className="text-white text-xs font-bold">
                  {tipoVegetalLabel(vegetal.tipo)}
                </Text>
              </View>
              <Text className="text-gray-900 text-sm font-semibold">
                {vegetal.nome}
              </Text>
            </View>

            {/* Saldos */}
            <View className="flex-row gap-2">
              <View className="bg-primary-50 px-2 py-1 rounded-md">
                <Text className="text-primary-700 text-xs font-medium">
                  Estoque: {vegetal.litrosEstoque} L
                </Text>
              </View>
              <View className="bg-blue-50 px-2 py-1 rounded-md">
                <Text className="text-blue-700 text-xs font-medium">
                  Geladeira: {vegetal.litrosGeladeira} L
                </Text>
              </View>
            </View>

            {isEnchanced && (
              <Text className="text-xs text-gray-500">
                {nucleoName} • {regiaoName}
              </Text>
            )}
          </View>

          <View className="flex-row items-center gap-2">
            {!isEnchanced && (
              <>
                <TouchableOpacity
                  onPress={() => onEdit(vegetal)}
                  className="p-2 bg-primary-100 rounded-md active:bg-primary-200"
                  activeOpacity={0.7}
                >
                  <Edit2 color={COLORS.primary.DEFAULT} size={16} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDelete(vegetal.id)}
                  className={`p-2 rounded-md ${
                    isDeleting ? "bg-red-50" : "bg-red-100 active:bg-red-50"
                  }`}
                  disabled={isDeleting}
                  activeOpacity={0.7}
                >
                  <Trash2 color="#EF4444" size={16} />
                </TouchableOpacity>
              </>
            )}
            <View className="ml-1">
              {isExpanded ? (
                <ChevronUp color="#6B7280" size={20} />
              ) : (
                <ChevronDown color="#6B7280" size={20} />
              )}
            </View>
          </View>
        </View>
      </Pressable>

      {isExpanded && (
        <View className="px-4 pb-4 space-y-3">
          <View className="bg-gray-50 rounded-lg p-3 gap-2">
            <View className="flex-row items-center gap-2">
              <Calendar color="#9CA3AF" size={14} />
              <Text className="text-sm text-gray-700">
                Preparo: {formatDate(vegetal.dataPreparo)}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <User color="#9CA3AF" size={14} />
              <Text className="text-sm text-gray-700">
                Mestre: {vegetal.mestrePreparo || "—"}
              </Text>
            </View>
          </View>

          {vegetal.observacoes ? (
            <View className="bg-gray-50 rounded-lg p-3">
              <Text className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Observações
              </Text>
              <Text className="text-sm text-gray-900 leading-5">
                {vegetal.observacoes}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}
