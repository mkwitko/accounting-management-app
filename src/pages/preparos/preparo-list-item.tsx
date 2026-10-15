import { useViewContext } from "@/src/context/view-context";
import type { GetAllPreparos200Item } from "@/src/http/generated/api.schemas";
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

interface PreparoListItemProps {
  preparo: GetAllPreparos200Item;
  onEdit: (preparo: GetAllPreparos200Item) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  isLast: boolean;
}

export function PreparoListItem({
  preparo,
  onEdit,
  onDelete,
  isDeleting,
  isLast,
}: PreparoListItemProps) {
  const { isEnchanced } = useViewContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const nucleoName = preparo.Nucleos?.nome || "Núcleo desconhecido";
  const regiaoName = preparo.Nucleos?.regioes?.nome || "Região desconhecida";

  return (
    <View
      className={`bg-white ${!isLast ? "border-b border-gray-100" : ""}`}
      accessibilityLabel={`Preparo de ${preparo.producaoLitros} litros`}
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
              <View className="bg-primary py-1.5 px-4 rounded-lg">
                <Text className="text-white text-sm font-bold">
                  {preparo.producaoLitros}L
                </Text>
              </View>

              <View className="flex-row items-center gap-1.5 mb-1">
                <Calendar color="#9CA3AF" size={14} />
                <Text className="text-gray-600 text-xs font-medium">
                  {formatDate(preparo.inicio)} - {formatDate(preparo.fim)}
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
                  onPress={() => onEdit(preparo)}
                  className="p-2 bg-primary-100 rounded-md active:bg-primary-200"
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Editar preparo"
                >
                  <Edit2 color={COLORS.primary.DEFAULT} size={16} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onDelete(preparo.id)}
                  disabled={isDeleting}
                  className={`p-2 rounded-md ${
                    isDeleting ? "bg-red-50" : "bg-red-100 active:bg-red-50"
                  }`}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Excluir preparo"
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
          {/* Mariri Section */}
          {preparo.mariri && (
            <View className="bg-gray-50 rounded-lg p-3">
              <Text className="text-xs font-bold text-gray-700 tracking-wide mb-3">
                Mariri
              </Text>
              <View className="space-y-2">
                <InfoRow label="Tipo" value={preparo.mariri.tipo} capitalize />
                <InfoRow label="Peso" value={`${preparo.mariri.pesoKg} kg`} />
                {preparo.mariri.unidades && (
                  <InfoRow
                    label="Nº de plantas"
                    value={preparo.mariri.unidades.toString()}
                  />
                )}
                {preparo.mariri.tipoPlantacao && (
                  <InfoRow
                    label="Plantio"
                    value={preparo.mariri.tipoPlantacao}
                    capitalize
                  />
                )}
                {preparo.mariri.origemMensagem && (
                  <InfoRow
                    label="Origem"
                    value={preparo.mariri.origemMensagem}
                  />
                )}
              </View>
            </View>
          )}

          {/* Chacrona Section */}
          {preparo.chacrona && (
            <View className="bg-gray-50 rounded-lg p-3">
              <Text className="text-xs font-bold text-gray-700 tracking-wide mb-3">
                Chacrona
              </Text>
              <View className="space-y-2">
                <InfoRow label="Peso" value={`${preparo.chacrona.pesoKg} kg`} />
                {preparo.chacrona.unidades && (
                  <InfoRow
                    label="Nº de plantas"
                    value={preparo.chacrona.unidades.toString()}
                  />
                )}
                {preparo.chacrona.tipoPlantacao && (
                  <InfoRow
                    label="Plantio"
                    value={preparo.chacrona.tipoPlantacao}
                    capitalize
                  />
                )}
                {preparo.chacrona.origemMensagem && (
                  <InfoRow
                    label="Origem"
                    value={preparo.chacrona.origemMensagem}
                  />
                )}
              </View>
            </View>
          )}

          {/* Lenha Section */}
          {preparo.lenha && (
            <View className="bg-gray-50 rounded-lg p-3">
              <Text className="text-xs font-bold text-gray-700 tracking-wide mb-3">
                Lenha
              </Text>
              <View className="space-y-2">
                {preparo.lenha.quantidadeM2 && (
                  <InfoRow
                    label="Quantidade"
                    value={`${preparo.lenha.quantidadeM2} m²`}
                  />
                )}
                {preparo.lenha.tipoLenha && (
                  <InfoRow
                    label="Tipo"
                    value={preparo.lenha.tipoLenha}
                    capitalize
                  />
                )}
                {preparo.lenha.tipoFornalha && (
                  <InfoRow
                    label="Fornalha"
                    value={preparo.lenha.tipoFornalha}
                    capitalize
                  />
                )}
                {preparo.lenha.tempoFornalhaAcesa && (
                  <InfoRow
                    label="Tempo acesa"
                    value={`${preparo.lenha.tempoFornalhaAcesa}h`}
                  />
                )}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// Subcomponent for info rows
function InfoRow({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <View className="flex-row items-center">
      <Text className="text-xs text-gray-500 w-28">{label}:</Text>
      <Text
        className={`text-sm text-gray-700 flex-1 font-medium ${
          capitalize && "capitalize"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
