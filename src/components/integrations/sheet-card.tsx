import { ListUserSheets200SheetsItem } from "@/src/http/generated/api.schemas";
import { useDeleteSheetByTitle } from "@/src/http/generated/sheets/sheets";
import * as WebBrowser from "expo-web-browser";
import { Clock, Eye, FileSpreadsheet, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SheetCardProps {
  sheet: ListUserSheets200SheetsItem;
  isLast?: boolean;
  refetchSheets: () => void;
}

export default function SheetCard({
  sheet,
  isLast,
  refetchSheets,
}: SheetCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { mutateAsync: deleteSheetByTitle, isPending: isDeleting } =
    useDeleteSheetByTitle();

  const handleView = () => {
    if (sheet.webViewLink) {
      WebBrowser.openBrowserAsync(sheet.webViewLink);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSheetByTitle({
        title: sheet.name,
      });
      setShowDeleteModal(false);
      refetchSheets();
    } catch (error) {
      console.error("Erro ao excluir planilha:", error);
    }
  };

  return (
    <>
      <View
        className={`flex-row items-center justify-between p-4 bg-white rounded-xl shadow-sm ${
          !isLast ? "mb-3" : ""
        }`}
      >
        <View className="flex-row items-center flex-1 mr-3">
          <View className="w-10 h-10 rounded-lg bg-green-50 items-center justify-center mr-3">
            <FileSpreadsheet color="#16A34A" size={20} />
          </View>
          <View className="flex-1">
            <Text
              className="text-gray-900 font-semibold text-sm"
              numberOfLines={1}
            >
              {sheet.name.split(" - ")[1]}
            </Text>
            <View className="flex-row items-center mt-1">
              <Clock color="#9CA3AF" size={12} />
              <Text className="text-gray-500 text-xs ml-1">
                {new Date(sheet.modifiedTime).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleView}
            className="w-9 h-9 rounded-lg bg-green-50 items-center justify-center"
            activeOpacity={0.7}
          >
            <Eye color="#16A34A" size={18} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            className="w-9 h-9 rounded-lg bg-red-50 items-center justify-center"
            activeOpacity={0.7}
          >
            <Trash2 color="#DC2626" size={18} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de Confirmação */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="w-12 h-12 rounded-full bg-red-50 items-center justify-center mb-4 self-center">
              <Trash2 color="#DC2626" size={24} />
            </View>

            <Text className="text-gray-900 font-bold text-lg text-center mb-2">
              Excluir Planilha?
            </Text>

            <Text className="text-gray-600 text-sm text-center mb-6">
              Tem certeza que deseja excluir "{sheet.name}"? Esta ação não pode
              ser desfeita.
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-gray-100 items-center justify-center"
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-semibold text-sm">
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-red-600 items-center justify-center"
                activeOpacity={0.7}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-sm">
                    Excluir
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
