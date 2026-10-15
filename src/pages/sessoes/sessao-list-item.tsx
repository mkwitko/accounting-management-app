import { useViewContext } from "@/src/context/view-context";
import type { GetSessao200Item } from "@/src/http/generated/api.schemas";
import { COLORS } from "@/src/styles/colors";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { sessaoOptions } from "./sessao-types";
import { formatFloat } from "@/src/utils/format-float";

interface SessaoListItemProps {
  sessao: GetSessao200Item;
  onEdit: (sessao: GetSessao200Item) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  isLast: boolean;
}

export function SessaoListItem({
  sessao,
  onEdit,
  onDelete,
  isDeleting,
  isLast,
}: SessaoListItemProps) {
  const { isEnchanced } = useViewContext();

  const nucleoName = sessao.Nucleos?.nome || "Núcleo desconhecido";
  const regiaoName = sessao.Nucleos?.regioes?.nome || "Região desconhecida";

  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calculateLitersPorPessoa = () => {
    const vegetal = formatFloat(sessao.quantidadeVegetal);
    const pessoas = Number(sessao.pessoas);
    return pessoas > 0
      ? `${((vegetal / pessoas) * 1000).toFixed(0)} ml`
      : "0 ml";
  };

  const getSessaoLabel = () => {
    return (
      sessaoOptions.find((o) => o.value === sessao.sessao)?.label ||
      sessao.sessao
    );
  };

  return (
    <View
      className={`bg-white ${!isLast ? "border-b border-gray-100" : ""}`}
      accessibilityLabel={`Sessão ${getSessaoLabel()} em ${formatDate(
        sessao.data
      )}`}
    >
      {/* Compact Header - Always Visible */}
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        className="px-4 py-4 active:bg-gray-50"
        accessibilityRole="button"
        accessibilityLabel={
          isExpanded ? "Recolher detalhes" : "Expandir detalhes"
        }
      >
        <View className="flex-row items-center justify-between">
          {/* Left Section - Main Info */}
          <View className="flex-1 gap-2">
            <View className="flex-row items-center gap-3">
              {/* Type Badge */}
              <View className="bg-primary py-1.5 px-3 rounded-lg">
                <Text className="text-white text-xs font-bold">
                  {getSessaoLabel()}
                </Text>
              </View>

              <View className="flex-row items-center gap-1.5">
                <Calendar color="#9CA3AF" size={14} />
                <Text className="text-gray-600 text-xs font-medium">
                  {formatDate(sessao.data)}
                </Text>
              </View>
            </View>

            {/* Enhanced View - Núcleo e Região */}
            {isEnchanced && (
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-gray-500">
                  {nucleoName} • {regiaoName}
                </Text>
              </View>
            )}
          </View>

          {/* Right Section - Actions */}
          <View className="flex-row items-center gap-2">
            {!isEnchanced && (
              <>
                <TouchableOpacity
                  onPress={() => onEdit(sessao)}
                  className="p-2 bg-primary-100 rounded-md active:bg-primary-200"
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Editar sessão"
                  accessibilityHint="Abre o formulário para editar esta sessão"
                >
                  <Edit2 color={COLORS.primary.DEFAULT} size={16} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onDelete(sessao.id)}
                  className={`p-2 rounded-md ${
                    isDeleting ? "bg-red-50" : "bg-red-100 active:bg-red-50"
                  }`}
                  disabled={isDeleting}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Excluir sessão"
                  accessibilityHint="Remove esta sessão permanentemente"
                  accessibilityState={{ disabled: isDeleting }}
                >
                  <Trash2 color="#EF4444" size={16} />
                </TouchableOpacity>
              </>
            )}

            {/* Expand/Collapse Icon */}
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

      {/* Expanded Content - Details */}
      {isExpanded && (
        <View className="px-4 pb-4 space-y-3">
          {/* Stats Section */}
          <View className="bg-gray-50 rounded-lg p-3">
            <View className="flex-row justify-between items-center">
              <InfoRow label="Pessoas" value={sessao.pessoas.toString()} />
              <InfoRow
                label="Vegetal consumido"
                value={`${sessao.quantidadeVegetal} L`}
              />
              <InfoRow
                label="Vegetal por pessoa"
                value={calculateLitersPorPessoa()}
              />
            </View>
          </View>

          {/* Vegetais consumidos */}
          {sessao.vegetais && sessao.vegetais.length > 0 && (
            <View className="bg-gray-50 rounded-lg p-3">
              <Text className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Vegetais consumidos
              </Text>
              {sessao.vegetais.map((v) => (
                <View
                  key={v.id}
                  className="flex-row justify-between items-center py-1"
                >
                  <Text className="text-sm text-gray-900">
                    {v.vegetal?.nome || "Vegetal"}
                    <Text className="text-xs text-gray-500">
                      {"  "}
                      {v.local === "geladeira" ? "geladeira" : "estoque"}
                    </Text>
                  </Text>
                  <Text className="text-sm text-gray-900 font-medium">
                    {v.quantidade} L
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Description Section */}
          {sessao.descricao && (
            <View className="bg-gray-50 rounded-lg p-3">
              <Text className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Observações
              </Text>
              <Text className="text-sm text-gray-900 leading-5">
                {sessao.descricao}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// Subcomponent for info rows
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex">
      <Text className="text-xs text-gray-500">{label}:</Text>
      <Text className="text-sm text-gray-900 flex-1 font-medium">{value}</Text>
    </View>
  );
}
