import React from "react";
import { Text, View } from "react-native";
import Header from "./header";
import HeaderTitle from "./header-title";

interface Props {
  // Controle à esquerda (menu ou voltar). Fica ancorado à esquerda
  // enquanto o título permanece centralizado na largura toda.
  left?: React.ReactNode;
  right?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function ScreenHeader({ left, right, title, subtitle }: Props) {
  return (
    <Header>
      <View className="min-h-[44px] justify-center">
        {/* Título centralizado na largura toda */}
        <View className="items-center px-14">
          <HeaderTitle title={title} />
          {subtitle ? (
            <Text className="text-primary-100 mt-1 text-sm text-center">
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Controles ancorados, sem empurrar o título */}
        {left ? (
          <View className="absolute left-0 top-0 bottom-0 justify-center">
            {left}
          </View>
        ) : null}
        {right ? (
          <View className="absolute right-0 top-0 bottom-0 justify-center">
            {right}
          </View>
        ) : null}
      </View>
    </Header>
  );
}
