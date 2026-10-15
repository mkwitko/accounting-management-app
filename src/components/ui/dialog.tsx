import { Modal, ModalProps, View } from "react-native";
import KeyboardSpacer from "../keyboard-spacer";

interface DialogProps extends ModalProps {
  children: React.ReactNode;
  open: boolean;
  withInteractivity?: boolean;
}

export function Dialog({
  children,
  open,
  withInteractivity = false,
  ...rest
}: DialogProps) {
  const content = withInteractivity ? (
    <>
      {children}
      <KeyboardSpacer />
    </>
  ) : (
    <View className="bg-black/80 items-center justify-center w-full flex-1 px-4">
      {children}
    </View>
  );

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      {...rest}
    >
      {content}
    </Modal>
  );
}
