import { QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import ToastManager from "toastify-react-native";
import { AuthContextProvider } from "./context/auth-context";
import { ViewContextProvider } from "./context/view-context";
import { queryClient } from "./lib/react-query";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <ViewContextProvider>{children}</ViewContextProvider>
      </AuthContextProvider>
      <ToastManager />
    </QueryClientProvider>
  );
}
