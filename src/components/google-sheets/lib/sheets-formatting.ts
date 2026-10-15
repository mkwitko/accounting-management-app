/**
 * Cores modernas e harmônicas para formatação de planilhas
 */
export const SHEET_COLORS = {
  // Cores principais
  primaryGreen: { red: 0.15, green: 0.68, blue: 0.38 }, // #26AE60
  darkGreen: { red: 0.1, green: 0.49, blue: 0.29 }, // #1A7D4A
  lightGreen: { red: 0.91, green: 0.98, blue: 0.94 }, // #E8F8F0

  // Cores de destaque
  accentTeal: { red: 0.11, green: 0.63, blue: 0.71 }, // #1CA1B5
  lightTeal: { red: 0.89, green: 0.97, blue: 0.98 }, // #E3F7F9

  // Cores neutras
  white: { red: 1, green: 1, blue: 1 },
  darkText: { red: 0.2, green: 0.25, blue: 0.28 }, // #334047
  lightGray: { red: 0.85, green: 0.88, blue: 0.89 }, // #D9E1E2
} as const

/**
 * Tamanhos padrão para linhas e colunas
 */
export const SHEET_DIMENSIONS = {
  columnWidth: 220,
  rowHeights: {
    title: 60,
    section: 45,
    header: 35,
    value: 40,
    subtitle: 30,
    spacing: 15,
    notes: 65,
  },
} as const

/**
 * Interface para range de merge
 */
export interface MergeRange {
  startRow: number
  endRow: number
  startColumn: number
  endColumn: number
}

/**
 * Interface para formatação de célula
 */
export interface CellFormat {
  backgroundColor?: { red: number; green: number; blue: number }
  textFormat?: {
    bold?: boolean
    fontSize?: number
    italic?: boolean
    foregroundColor?: { red: number; green: number; blue: number }
  }
  horizontalAlignment?: "LEFT" | "CENTER" | "RIGHT"
  verticalAlignment?: "TOP" | "MIDDLE" | "BOTTOM"
  wrapStrategy?: "WRAP" | "OVERFLOW_CELL" | "CLIP"
}

/**
 * Cria uma requisição de formatação para um range específico
 */
export function createFormatRequest(
  sheetId: number,
  startRow: number,
  endRow: number,
  startColumn: number,
  endColumn: number,
  format: CellFormat,
) {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: startRow,
        endRowIndex: endRow,
        startColumnIndex: startColumn,
        endColumnIndex: endColumn,
      },
      cell: {
        userEnteredFormat: format,
      },
      fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)",
    },
  }
}

/**
 * Cria uma requisição de borda para um range específico
 */
export function createBorderRequest(
  sheetId: number,
  startRow: number,
  endRow: number,
  startColumn: number,
  endColumn: number,
  borderStyle: {
    top?: { style: string; width: number; color: { red: number; green: number; blue: number } }
    bottom?: { style: string; width: number; color: { red: number; green: number; blue: number } }
    left?: { style: string; width: number; color: { red: number; green: number; blue: number } }
    right?: { style: string; width: number; color: { red: number; green: number; blue: number } }
    innerHorizontal?: { style: string; width: number; color: { red: number; green: number; blue: number } }
    innerVertical?: { style: string; width: number; color: { red: number; green: number; blue: number } }
  },
) {
  return {
    updateBorders: {
      range: {
        sheetId,
        startRowIndex: startRow,
        endRowIndex: endRow,
        startColumnIndex: startColumn,
        endColumnIndex: endColumn,
      },
      ...borderStyle,
    },
  }
}

/**
 * Cria uma requisição de dimensão (largura de coluna ou altura de linha)
 */
export function createDimensionRequest(
  sheetId: number,
  dimension: "ROWS" | "COLUMNS",
  startIndex: number,
  endIndex: number,
  pixelSize: number,
) {
  return {
    updateDimensionProperties: {
      range: {
        sheetId,
        dimension,
        startIndex,
        endIndex,
      },
      properties: {
        pixelSize,
      },
      fields: "pixelSize",
    },
  }
}

/**
 * Formatos pré-definidos comuns
 */
export const COMMON_FORMATS = {
  title: {
    backgroundColor: SHEET_COLORS.darkGreen,
    textFormat: {
      bold: true,
      fontSize: 18,
      foregroundColor: SHEET_COLORS.white,
    },
    horizontalAlignment: "CENTER" as const,
    verticalAlignment: "MIDDLE" as const,
  },
  sectionHeader: {
    backgroundColor: SHEET_COLORS.primaryGreen,
    textFormat: {
      bold: true,
      fontSize: 13,
      foregroundColor: SHEET_COLORS.white,
    },
    horizontalAlignment: "CENTER" as const,
    verticalAlignment: "MIDDLE" as const,
  },
  columnHeader: {
    backgroundColor: SHEET_COLORS.lightTeal,
    textFormat: {
      bold: true,
      fontSize: 10,
      foregroundColor: SHEET_COLORS.darkText,
    },
    horizontalAlignment: "CENTER" as const,
    verticalAlignment: "MIDDLE" as const,
  },
  valueCell: {
    backgroundColor: SHEET_COLORS.white,
    textFormat: {
      bold: true,
      fontSize: 12,
      foregroundColor: SHEET_COLORS.primaryGreen,
    },
    horizontalAlignment: "CENTER" as const,
    verticalAlignment: "MIDDLE" as const,
  },
  valueCellAlt: {
    backgroundColor: SHEET_COLORS.white,
    textFormat: {
      bold: true,
      fontSize: 11,
      foregroundColor: SHEET_COLORS.accentTeal,
    },
    horizontalAlignment: "CENTER" as const,
    verticalAlignment: "MIDDLE" as const,
  },
  subtitle: {
    backgroundColor: SHEET_COLORS.lightGreen,
    textFormat: {
      bold: false,
      fontSize: 10,
      italic: true,
      foregroundColor: SHEET_COLORS.darkText,
    },
    horizontalAlignment: "CENTER" as const,
    verticalAlignment: "MIDDLE" as const,
  },
  notes: {
    backgroundColor: SHEET_COLORS.lightGreen,
    textFormat: {
      bold: false,
      fontSize: 9,
      foregroundColor: SHEET_COLORS.darkText,
    },
    horizontalAlignment: "LEFT" as const,
    verticalAlignment: "TOP" as const,
    wrapStrategy: "WRAP" as const,
  },
  spacing: {
    backgroundColor: SHEET_COLORS.white,
  },
} as const
