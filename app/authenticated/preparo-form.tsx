import HeaderBackButton from "@/src/components/header/header-back-button";
import ScreenHeader from "@/src/components/header/screen-header";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { z } from "zod";

import {
  useCreatePreparo,
  useGetAllPreparos,
  useGetPreparoById,
  useUpdatePreparo,
} from "@/src/http/generated/preparos/preparos";
import { useFindMe } from "@/src/http/generated/user/user";

import { ChacronaStep } from "@/src/pages/preparos/preparo-form-step/chacrona";
import { LenhaStep } from "@/src/pages/preparos/preparo-form-step/lenha";
import { MaririStep } from "@/src/pages/preparos/preparo-form-step/mariri";
import { PreparoInfoStep } from "@/src/pages/preparos/preparo-form-step/preparo";
import { AlertModal } from "@/src/pages/sessoes/alert-modal";
import { AlertConfig } from "@/src/pages/sessoes/sessao-types";

import { useViewContext } from "@/src/context/view-context";
import useAddPreparoSheet from "@/src/pages/preparos/hooks/use-add-preparo-sheet";
import {
  PreparoFormData,
  chacronaSchema,
  lenhaSchema,
  maririSchema,
  preparoInfoSchema,
} from "@/src/pages/preparos/schema/preparo-schema";
import KeyboardSpacer from "@/src/components/keyboard-spacer";

// 🧩 Combina todos os schemas em um só
const fullPreparoSchema = z.object({
  mariri: maririSchema,
  chacrona: chacronaSchema,
  lenha: lenhaSchema,
  preparoInfo: preparoInfoSchema,
});

const STEPS = [
  { id: 1, title: "Mariri", component: MaririStep },
  { id: 2, title: "Chacrona", component: ChacronaStep },
  { id: 3, title: "Lenha", component: LenhaStep },
  { id: 4, title: "Informações", component: PreparoInfoStep },
];

export default function PreparoFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editingId = params.id as string | undefined;
  const { generalView, regionView, nucleoView } = useViewContext();

  const { data: user } = useFindMe();
  const { refetch } = useGetAllPreparos({
    generalView,
    regionView,
    nucleoView,
  });

  const { data: preparoData } = useGetPreparoById(editingId as string, {
    query: {
      enabled: !!editingId,
    },
  });

  const { mutateAsync: createPreparo, isPending: creating } =
    useCreatePreparo();
  const { mutateAsync: updatePreparo, isPending: updating } =
    useUpdatePreparo();

  const { addPreparoSheet } = useAddPreparoSheet();

  const [currentStep, setCurrentStep] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    type: "success",
    message: "",
    title: "",
    onConfirm: null,
    showCancel: false,
  });

  // 🪄 Hook form setup
  const methods = useForm<PreparoFormData>({
    resolver: zodResolver(fullPreparoSchema),
    mode: "onChange",
  });

  const { setValue, watch, handleSubmit } = methods;

  // 🧭 Carregar dados se for edição
  useEffect(() => {
    if (editingId && preparoData) {
      setValue("mariri", preparoData.mariri ?? watch("mariri"));
      setValue("chacrona", preparoData.chacrona ?? watch("chacrona"));
      setValue("lenha", preparoData.lenha ?? watch("lenha"));
      setValue("preparoInfo", {
        inicio: new Date(preparoData.inicio),
        fim: new Date(preparoData.fim),
        producaoLitros: preparoData.producaoLitros,
        nucleoId: user?.nucleo?.id || "",
      });
    }
  }, [editingId, preparoData, user]);

  // 🧩 Handler de cada passo
  const handleStepComplete = async (stepData: any) => {
    const stepKey =
      STEPS[currentStep - 1].title.toLowerCase() === "informações"
        ? "preparoInfo"
        : STEPS[currentStep - 1].title.toLowerCase();

    setValue(stepKey as keyof PreparoFormData, stepData);

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit(onSubmit)();
    }
  };

  // 🧾 Submissão final
  const onSubmit = async (data: PreparoFormData) => {
    try {
      const payload = {
        inicio: data.preparoInfo.inicio.toISOString(),
        fim: data.preparoInfo.fim.toISOString(),
        producaoLitros: data.preparoInfo.producaoLitros,
        nucleosId: user?.nucleo?.id as string,
        mariri: {
          ...data.mariri,
          id: data.mariri.id as string,
        },
        chacrona: {
          ...data.chacrona,
          id: data.chacrona.id as string,
        },
        lenha: {
          ...data.lenha,
          id: data.lenha.id as string,
        },
      };

      if (editingId) {
        await updatePreparo({ data: { id: editingId, ...payload } });
        showSuccessAlert("Preparo atualizado com sucesso!");
      } else {
        await createPreparo({ data: payload });
        showSuccessAlert("Preparo criado com sucesso!");
      }

      const { data: updatedPreparos } = await refetch();
      addPreparoSheet(data, updatedPreparos || []);
    } catch (error) {
      showErrorAlert("Erro ao salvar preparo. Tente novamente.");
    }
  };

  const showSuccessAlert = (message: string) => {
    setAlertConfig({
      type: "success",
      title: "Sucesso!",
      message,
      onConfirm: () => {
        setShowAlert(false);
        router.replace("/authenticated/preparo");
      },
      showCancel: false,
    });
    setShowAlert(true);
  };

  const showErrorAlert = (message: string) => {
    setAlertConfig({
      type: "error",
      title: "Erro",
      message,
      onConfirm: () => setShowAlert(false),
      showCancel: false,
    });
    setShowAlert(true);
  };

  return (
    <FormProvider {...methods}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <ScreenHeader
          left={
            <HeaderBackButton
              label=""
              onPress={() =>
                currentStep > 1
                  ? setCurrentStep(currentStep - 1)
                  : router.replace("/authenticated/preparo")
              }
            />
          }
          title={editingId ? "Editar Preparo" : "Novo Preparo"}
          subtitle={`Passo ${currentStep} de ${STEPS.length}: ${
            STEPS[currentStep - 1].title
          }`}
        />

        {/* Progress */}
        <View className="bg-white px-6 py-4 shadow-sm">
          <View className="flex-row justify-between items-center">
            {STEPS.map((step, index) => (
              <View key={step.id} className="flex-1 items-center">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    index + 1 <= currentStep ? "bg-primary-600" : "bg-gray-200"
                  }`}
                >
                  {index + 1 < currentStep ? (
                    <Check color="#FFFFFF" size={20} />
                  ) : (
                    <Text
                      className={`font-bold ${
                        index + 1 === currentStep
                          ? "text-white"
                          : "text-gray-500"
                      }`}
                    >
                      {step.id}
                    </Text>
                  )}
                </View>
                <Text
                  className={`text-xs mt-2 text-center ${
                    index + 1 === currentStep
                      ? "text-primary-600 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Step content — cada step tem scroll próprio + footer sticky */}
        <View className="flex-1 w-full web:max-w-2xl web:self-center">
          {currentStep === 1 && (
            <MaririStep
              onComplete={handleStepComplete}
              initialData={watch("mariri")}
              isSubmitting={creating || updating}
            />
          )}
          {currentStep === 2 && (
            <ChacronaStep
              onComplete={handleStepComplete}
              initialData={watch("chacrona")}
              isSubmitting={creating || updating}
            />
          )}
          {currentStep === 3 && (
            <LenhaStep
              onComplete={handleStepComplete}
              initialData={watch("lenha")}
              isSubmitting={creating || updating}
            />
          )}
          {currentStep === 4 && (
            <PreparoInfoStep
              onComplete={handleStepComplete}
              initialData={watch("preparoInfo")}
              isSubmitting={creating || updating}
            />
          )}
        </View>

        <AlertModal
          visible={showAlert}
          config={alertConfig}
          onClose={() => setShowAlert(false)}
        />
      </View>

      <KeyboardSpacer />
    </FormProvider>
  );
}
