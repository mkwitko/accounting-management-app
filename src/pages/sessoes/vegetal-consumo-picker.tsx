import CustomPicker from "@/src/components/custom-picker";
import HelpModal from "@/src/components/help-modal";
import { useViewContext } from "@/src/context/view-context";
import { useGetVegetal } from "@/src/http/generated/vegetal/vegetal";
import type { ConsumoVegetal } from "@/src/pages/sessoes/sessao-types";
import { localVegetalOptions } from "@/src/pages/vegetal/vegetal-types";
import { formatFloat } from "@/src/utils/format-float";
import { formatDecimalInput } from "@/src/utils/input-mask";
import { useRouter } from "expo-router";
import { HelpCircle, Leaf, Plus, Trash2, TriangleAlert } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  value: ConsumoVegetal[];
  onChange: (next: ConsumoVegetal[]) => void;
}

type HelpContent = { title: string; message: string };

export function VegetalConsumoPicker({ value, onChange }: Props) {
  const router = useRouter();
  const [help, setHelp] = useState<HelpContent | null>(null);

  const HelpButton = ({ title, message }: HelpContent) => (
    <TouchableOpacity
      onPress={() => setHelp({ title, message })}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      activeOpacity={0.6}
    >
      <HelpCircle color="#9CA3AF" size={18} />
    </TouchableOpacity>
  );

  const { generalView, regionView, nucleoView } = useViewContext();
  const { data: vegetais, isLoading } = useGetVegetal({
    generalView,
    regionView,
    nucleoView,
  });

  const vegetalOptions = useMemo(() => {
    // Mesma ordenação do estoque: mais novo primeiro; sem data no fim;
    // empate/sem data ordena por litragem total (maior primeiro).
    return [...(vegetais ?? [])]
      .sort((a, b) => {
        const da = a.dataPreparo ? new Date(a.dataPreparo).getTime() : null;
        const db = b.dataPreparo ? new Date(b.dataPreparo).getTime() : null;
        if (da === null && db !== null) return 1;
        if (da !== null && db === null) return -1;
        if (da !== null && db !== null && da !== db) return db - da;
        const la = formatFloat(a.litrosEstoque) + formatFloat(a.litrosGeladeira);
        const lb = formatFloat(b.litrosEstoque) + formatFloat(b.litrosGeladeira);
        return lb - la;
      })
      .map((v) => ({ value: v.id, label: v.nome }));
  }, [vegetais]);

  const total = useMemo(
    () => value.reduce((s, c) => s + formatFloat(c.quantidade || "0"), 0),
    [value]
  );

  const saldoDisponivel = (vegetalId: string, local: string) => {
    const veg = (vegetais ?? []).find((v) => v.id === vegetalId);
    if (!veg) return null;
    return formatFloat(
      local === "geladeira" ? veg.litrosGeladeira : veg.litrosEstoque
    );
  };

  const addRow = () => {
    onChange([
      ...value,
      { vegetalId: "", local: "estoque", quantidade: "", filtrado: "" },
    ]);
  };

  const updateRow = (index: number, patch: Partial<ConsumoVegetal>) => {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <View className="py-6 items-center">
        <ActivityIndicator size="small" color="#4a7c32" />
        <Text className="text-gray-500 text-sm mt-2">
          Carregando vegetais...
        </Text>
      </View>
    );
  }

  return (
    <View>
      {value.map((row, index) => {
        const temVegetal = !!row.vegetalId;
        const saldo = saldoDisponivel(row.vegetalId, row.local);
        // O filtrado é o que sai do estoque; sem valor, usa o consumido.
        const filtrado = formatFloat(row.filtrado || row.quantidade || "0");
        const insuficiente = saldo !== null && filtrado > saldo;

        return (
          <View
            key={index}
            className="border border-gray-200 rounded-xl p-3 mb-3 bg-gray-50"
          >
            {/* Cabeçalho da linha */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-700 font-semibold text-sm">
                {index + 1}º consumo
              </Text>
              <TouchableOpacity
                onPress={() => removeRow(index)}
                className="p-1.5 bg-red-100 rounded-md active:bg-red-50"
                activeOpacity={0.7}
              >
                <Trash2 color="#EF4444" size={16} />
              </TouchableOpacity>
            </View>

            {/* Vegetal (opcional) */}
            <View className="flex-row items-center gap-1.5 mb-1">
              <Text className="text-gray-500 text-xs">Vegetal (opcional)</Text>
              <HelpButton
                title="Vegetal (opcional)"
                message="Escolha o Vegetal para descontar os litros do estoque. Deixe vazio para apenas registrar a quantidade, sem mexer no estoque."
              />
            </View>
            <View className="border border-gray-300 rounded-lg overflow-hidden mb-3 bg-white">
              <CustomPicker
                options={vegetalOptions}
                selectedValue={row.vegetalId}
                onValueChange={(v) => updateRow(index, { vegetalId: v })}
                placeholder="Nenhum"
              />
            </View>

            {temVegetal ? (
              <>
                {/* De onde sai */}
                <Text className="text-gray-500 text-xs mb-1">De onde sai</Text>
                <View className="border border-gray-300 rounded-lg overflow-hidden mb-3 bg-white">
                  <CustomPicker
                    options={localVegetalOptions}
                    selectedValue={row.local}
                    onValueChange={(v) =>
                      updateRow(index, { local: v as ConsumoVegetal["local"] })
                    }
                  />
                </View>

                {/* Filtrado + Consumido */}
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1 mb-1">
                      <Text className="text-gray-500 text-xs">Filtrado (L)</Text>
                      <HelpButton
                        title="Filtrado"
                        message="Litros retirados do estoque para a sessão. É esse valor que desconta do estoque."
                      />
                    </View>
                    <TextInput
                      value={row.filtrado}
                      onChangeText={(text) =>
                        updateRow(index, { filtrado: formatDecimalInput(text) })
                      }
                      placeholder="Litros"
                      keyboardType="numeric"
                      className={`border ${
                        insuficiente ? "border-red-500" : "border-gray-300"
                      } rounded-lg px-4 py-3 bg-white text-base`}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1 mb-1">
                      <Text className="text-gray-500 text-xs">
                        Consumido (L)
                      </Text>
                      <HelpButton
                        title="Consumido"
                        message="Litros efetivamente consumidos na sessão. A diferença (filtrado − consumido) pode virar saldo na geladeira."
                      />
                    </View>
                    <TextInput
                      value={row.quantidade}
                      onChangeText={(text) =>
                        updateRow(index, {
                          quantidade: formatDecimalInput(text),
                        })
                      }
                      placeholder="Litros"
                      keyboardType="numeric"
                      className="border border-gray-300 rounded-lg px-4 py-3 bg-white text-base"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Saldo / alerta */}
                <View className="flex-row items-center gap-1.5 mt-2">
                  {insuficiente && <TriangleAlert color="#EF4444" size={14} />}
                  <Text
                    className={`text-xs ${
                      insuficiente ? "text-red-500" : "text-gray-500"
                    }`}
                  >
                    {insuficiente
                      ? `Filtrado excede o saldo (${saldo ?? 0} L)`
                      : `Saldo: ${saldo ?? 0} L`}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text className="text-gray-500 text-xs mb-1">
                  Quantidade em litros (obrigatório)
                </Text>
                <TextInput
                  value={row.quantidade}
                  onChangeText={(text) =>
                    updateRow(index, { quantidade: formatDecimalInput(text) })
                  }
                  placeholder="Litros"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white text-base"
                  placeholderTextColor="#9CA3AF"
                />
              </>
            )}
          </View>
        );
      })}

      <TouchableOpacity
        onPress={addRow}
        className="flex-row items-center justify-center gap-2 border border-dashed border-primary-400 rounded-lg py-3 active:bg-primary-50"
        activeOpacity={0.7}
      >
        <Plus color="#4a7c32" size={18} />
        <Text className="text-primary-700 font-semibold text-sm">
          Adicionar consumo
        </Text>
      </TouchableOpacity>

      {!vegetalOptions.length && (
        <TouchableOpacity
          onPress={() => router.push("/authenticated/vegetal-form")}
          className="flex-row items-center justify-center gap-2 mt-2"
          activeOpacity={0.7}
        >
          <Leaf color="#9CA3AF" size={14} />
          <Text className="text-gray-500 text-xs">
            Nenhum Vegetal no estoque — cadastrar
          </Text>
        </TouchableOpacity>
      )}

      {value.length > 0 && (
        <View className="mt-3 flex-row items-center justify-between bg-primary-50 rounded-lg px-3 py-3">
          <Text className="text-primary-800 font-semibold text-sm">
            Total: {total.toFixed(2)} L
          </Text>
          <HelpButton
            title="Total consumido"
            message="Soma de todos os litros informados, com ou sem Vegetal escolhido."
          />
        </View>
      )}

      <HelpModal
        visible={!!help}
        title={help?.title ?? ""}
        message={help?.message ?? ""}
        onClose={() => setHelp(null)}
      />
    </View>
  );
}
