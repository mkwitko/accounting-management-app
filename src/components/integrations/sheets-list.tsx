import { ListUserSheets200SheetsItem } from "@/src/http/generated/api.schemas";
import { FileSpreadsheet } from "lucide-react-native";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import SheetCard from "./sheet-card";

interface SheetsListProps {
  sheets?: ListUserSheets200SheetsItem[];
  isLoading: boolean;
  isRefetching: boolean;
  refetchSheets: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore?: boolean;
}

export default function SheetsList({
  sheets,
  isLoading,
  isRefetching,
  refetchSheets,
  onLoadMore,
  hasMore,
  isLoadingMore = false,
}: SheetsListProps) {
  return (
    <View className="p-5 bg-gray-50">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-900 font-bold text-base">
          Planilhas Criadas
        </Text>
        {isLoading || isRefetching ? (
          <ActivityIndicator color="#16A34A" size="small" />
        ) : (
          sheets &&
          sheets.length > 0 && (
            <View className="px-3 py-1 rounded-full bg-green-100">
              <Text className="text-green-700 text-xs font-bold">
                {sheets.length}
              </Text>
            </View>
          )
        )}
      </View>

      {isLoading ? (
        <View className="bg-white rounded-xl p-8 items-center justify-center">
          <ActivityIndicator color="#16A34A" size="large" />
          <Text className="text-gray-600 mt-3 text-sm">
            Carregando planilhas...
          </Text>
        </View>
      ) : sheets && sheets.length > 0 ? (
        <>
          {sheets.map((sheet, index) => (
            <SheetCard
              key={sheet.id}
              sheet={sheet}
              isLast={index === sheets.length - 1 && !hasMore}
              refetchSheets={refetchSheets}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <TouchableOpacity
              onPress={onLoadMore}
              disabled={isLoadingMore}
              className="bg-white rounded-xl p-4 mt-2 items-center border border-gray-200 active:bg-gray-50"
              activeOpacity={0.7}
            >
              {isLoadingMore ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#16A34A" size="small" />
                  <Text className="text-gray-600 text-sm ml-2 font-medium">
                    Carregando mais...
                  </Text>
                </View>
              ) : (
                <Text className="text-green-600 text-sm font-bold">
                  Carregar Mais Planilhas
                </Text>
              )}
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View className="bg-white rounded-xl p-6 items-center">
          <FileSpreadsheet color="#D1D5DB" size={40} />
          <Text className="text-gray-500 text-sm mt-3 text-center">
            Nenhuma planilha criada ainda
          </Text>
          <Text className="text-gray-400 text-xs mt-1 text-center">
            Clique em "Sincronizar Dados" para criar sua primeira planilha
          </Text>
        </View>
      )}
    </View>
  );
}
