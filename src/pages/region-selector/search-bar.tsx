import { Search } from "lucide-react-native";
import { TextInput, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder,
}: SearchBarProps) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200 flex-row items-center shadow-sm">
      <Search color="#9CA3AF" size={22} strokeWidth={2.5} />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        className="flex-1 ml-3 text-gray-900 text-base"
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}
