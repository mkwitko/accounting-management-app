
import AsyncStorage from "@react-native-async-storage/async-storage";

export const savePeriodoCache = async (inicio: Date, fim: Date, key: string) => {
  try {
    console.log("Saving periodo to cache:", { inicio, fim, key });
    await AsyncStorage.setItem(
      key,
      JSON.stringify({ inicio: inicio.toISOString(), fim: fim.toISOString() })
    );
  } catch (error) {
    console.error("Erro ao salvar período em cache:", error);
  }
};

export const loadPeriodoCache = async (key: string): Promise<{ inicio: Date; fim: Date } | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue != null) {
      const parsed = JSON.parse(jsonValue);
      return { inicio: new Date(parsed.inicio), fim: new Date(parsed.fim) };
    }
  } catch (error) {
    console.error("Erro ao carregar período do cache:", error);
  }
  return null;
};
