import { TouchableOpacity } from "react-native"
import { Plus } from "lucide-react-native"

interface FloatingActionButtonProps {
  onPress: () => void
}

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="absolute bottom-6 right-6 bg-primary rounded-full flex-row items-center gap-2 p-4"
    >
      <Plus color="white" size={24} />
    </TouchableOpacity>
  )
}
