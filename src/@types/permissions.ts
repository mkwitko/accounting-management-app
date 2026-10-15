export const PERMISSIONS_ENUM = {
  // Criação (usado no painel web)
  CRIAR_USUARIOS: "CRIAR_USUARIOS",
  CRIAR_NUCLEOS: "CRIAR_NUCLEOS",
  CRIAR_REGIOES: "CRIAR_REGIOES",
  // Visualização (hierárquico)
  VER_NUCLEOS: "VER_NUCLEOS",
  VER_REGIOES: "VER_REGIOES",
  // Exportação (espelha visualização)
  EXPORTAR_NUCLEOS: "EXPORTAR_NUCLEOS",
  EXPORTAR_REGIOES: "EXPORTAR_REGIOES",
  // Super
  ADMINISTRADOR: "ADMINISTRADOR",
} as const;

export type PermissionsEnum =
  (typeof PERMISSIONS_ENUM)[keyof typeof PERMISSIONS_ENUM];
