import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { ChevronDown, Check } from "lucide-react-native";

interface PickerOption {
  label: string;
  value: string;
}

interface CustomMultiPickerProps {
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  options: PickerOption[];
  placeholder?: string;
  disabled?: boolean;
}

export default function CustomMultiPicker({
  selectedValues,
  onValueChange,
  options,
  placeholder = "Selecione opções...",
  disabled = false,
}: CustomMultiPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onValueChange(selectedValues.filter((v) => v !== value));
    } else {
      onValueChange([...selectedValues, value]);
    }
  };

  const displayText =
    selectedValues.length === 0
      ? placeholder
      : `${selectedValues.length} selecionado(s)`;

  return (
    <>
      <TouchableOpacity
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        className={`flex-row items-center justify-between h-12 px-4 bg-white border border-gray-300 rounded-lg ${
          disabled ? "opacity-50" : ""
        }`}
        activeOpacity={0.7}
      >
        <Text
          numberOfLines={1}
          className={`flex-1 text-base ${
            selectedValues.length ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {displayText}
        </Text>
        <ChevronDown size={20} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setModalVisible(false)}
        >
          <Pressable className="bg-white rounded-t-3xl max-h-96">
            <View className="p-4 border-b border-gray-200">
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
              <Text className="text-lg font-semibold text-gray-900">
                Selecione as opções
              </Text>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = selectedValues.includes(item.value);

                return (
                  <TouchableOpacity
                    onPress={() => toggleValue(item.value)}
                    className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
                    activeOpacity={0.6}
                  >
                    <Text
                      className={`text-base ${
                        isSelected
                          ? "text-blue-600 font-semibold"
                          : "text-gray-900"
                      }`}
                    >
                      {item.label}
                    </Text>

                    {isSelected && <Check size={20} color="#2563EB" />}
                  </TouchableOpacity>
                );
              }}
            />

            <View className="p-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-blue-600 rounded-lg py-3"
              >
                <Text className="text-white text-center font-semibold">
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
