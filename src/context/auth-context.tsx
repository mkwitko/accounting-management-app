import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { PERMISSIONS_ENUM, PermissionsEnum } from "../@types/permissions";
import { FindMe201 } from "../http/generated/api.schemas";
import {
  useAuthenticationStatus,
  useSignOut,
} from "../http/generated/authentication/authentication";
import { useFindMe } from "../http/generated/user/user";
import { setLogoutHandler } from "../lib/api";
import { queryClient } from "../lib/react-query";
interface Features {
  // Opcionais; Relatórios é padrão do projeto.
  estoque: boolean;
  integracoes: boolean;
}

interface AuthContextProps {
  isReady: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  user: FindMe201 | undefined;
  loggingOut: boolean;
  userHasRole: (role: PermissionsEnum | PermissionsEnum[]) => boolean;
  features: Features;
  acessoPendente: boolean;
}

export const AuthContext = createContext<AuthContextProps>(
  {} as AuthContextProps,
);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);

  const {
    data: authenticationStatus,
    isLoading: isLoadingAuthenticationStatus,
  } = useAuthenticationStatus();

  const { data: user, isLoading } = useFindMe({
    query: {
      enabled: authenticationStatus?.logged || false,
    },
  });

  const { mutateAsync: signOut } = useSignOut();

  async function logoutTokenExpired() {
    setLoggingOut(true);
    await Promise.all([
      queryClient.cancelQueries({ queryKey: [], exact: false }),
      queryClient.clear(),
    ]);
    await Promise.all([
      SecureStore.deleteItemAsync("accessToken"),
      SecureStore.deleteItemAsync("refreshToken"),
    ]);
    router.replace("/public/signin");
    setLoggingOut(false);
  }

  async function logout() {
    try {
      setLoggingOut(true);
      await signOut();
      queryClient.removeQueries();
      queryClient.clear();
      await queryClient.cancelQueries();
      await Promise.all([
        SecureStore.deleteItemAsync("accessToken"),
        SecureStore.deleteItemAsync("refreshToken"),
      ]).catch((error) => {
        console.error("Error during logout process:", error);
      });
      router.replace("/public/signin");
      setLoggingOut(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  useEffect(() => {
    setLogoutHandler(async () => {
      await logoutTokenExpired();
    });
  }, []);

  const features: Features = {
    estoque: !!user?.nucleo?.estoqueAtivo,
    // Integrações é por usuário (não por núcleo).
    integracoes: !!user?.integracoesAtivo,
  };

  // Entrou, mas o cargo no Mural Digital não dá acesso. Não usar
  // `permissoes.length === 0`: o cargo LOCAL (Monitor do Plantio) tem acesso e
  // nenhuma permissão.
  const acessoPendente =
    (authenticationStatus?.logged || false) && user?.acessoLiberado === false;

  useEffect(() => {
    if (isLoadingAuthenticationStatus || isLoading) return;
    const logged = authenticationStatus?.logged;

    if (!logged) {
      router.replace("/public/signin");
      return;
    }

    if (acessoPendente) {
      router.replace("/authenticated/pending");
      return;
    }

    router.replace("/authenticated/(tabs)");
  }, [isLoadingAuthenticationStatus, isLoading, acessoPendente]);

  const userHasRole = (role: PermissionsEnum | PermissionsEnum[]) => {
    const roles = Array.isArray(role) ? role : [role];
    return (
      !!user?.permissoes.find(
        (r) =>
          roles.includes(r.name as PermissionsEnum) ||
          r.name === PERMISSIONS_ENUM.ADMINISTRADOR,
      ) || false
    );
  };

  return (
    <AuthContext.Provider
      value={{
        isReady: !isLoadingAuthenticationStatus && !isLoading,
        isAuthenticated: authenticationStatus?.logged || false,
        logout,
        user,
        loggingOut,
        userHasRole,
        features,
        acessoPendente,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
