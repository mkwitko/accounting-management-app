import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { ChevronDown, Check, Inbox } from "lucide-react-native";

interface PickerOption {
  label: string;
  value: string;
}

interface CustomPickerProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: PickerOption[];
  placeholder?: string;
  disabled?: boolean;
}

export default function CustomPicker({
  selectedValue,
  onValueChange,
  options,
  placeholder = "Selecione uma opção...",
  disabled = false,
}: CustomPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const displayText = selectedOption?.label || placeholder;

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

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
          className={`flex-1 text-base ${
            selectedValue ? "text-gray-900" : "text-gray-400"
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
                Selecione uma opção
              </Text>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              contentContainerStyle={{ paddingBottom: 32 }}
              ListEmptyComponent={
                <View className="px-4 py-10 items-center">
                  <Inbox size={32} color="#9CA3AF" />
                  <Text className="text-gray-500 text-sm mt-2 text-center">
                    Nada para selecionar
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item.value)}
                  className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
                  activeOpacity={0.6}
                >
                  <Text
                    className={`text-base ${
                      item.value === selectedValue
                        ? "text-blue-600 font-semibold"
                        : "text-gray-900"
                    }`}
                  >
                    {item.label}
                  </Text>
                  {item.value === selectedValue && (
                    <Check size={20} color="#2563EB" />
                  )}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
