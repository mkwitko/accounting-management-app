import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';

interface UpdateModalProps {
  visible: boolean;
  onUpdate: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ visible, onUpdate }) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible, scaleValue]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <Animated.View
          style={{
            transform: [{ scale: scaleValue }],
          }}
          className="bg-white rounded-3xl py-8 px-6 w-full max-w-sm items-center shadow-2xl overflow-hidden"
        >
          {/* Decorative elements */}
          <View className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-blue-500/10" />
          <View className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-blue-500/5" />

          {/* Icon */}
          <View className="mb-6">
            <View className="w-20 h-20 rounded-full bg-blue-600 justify-center items-center shadow-lg shadow-blue-500/30">
              <Text className="text-white text-3xl font-bold transform rotate-45">↑</Text>
            </View>
          </View>

          {/* Content */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
              Atualização Necessária
            </Text>
            <Text className="text-base text-gray-600 text-center leading-6">
              Uma nova versão do app está disponível com melhorias e correções importantes.
              Atualize agora para continuar usando o aplicativo.
            </Text>
          </View>

          {/* Button */}
          <TouchableOpacity
            className="bg-blue-600 py-4 px-8 rounded-xl w-full items-center shadow-lg shadow-blue-500/30 active:bg-blue-700"
            onPress={onUpdate}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-semibold">
              Atualizar Agora
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};