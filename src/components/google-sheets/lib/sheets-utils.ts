import type { MergeRange } from "./sheets-formatting"

/**
 * Cria uma matriz de dados com valores null para células vazias
 */
export function createDataMatrix(rows: number, columns: number): (string | null)[][] {
  return Array.from({ length: rows }, () => Array(columns).fill(null))
}

/**
 * Cria um merge range
 */
export function createMerge(startRow: number, endRow: number, startColumn: number, endColumn: number): MergeRange {
  return { startRow, endRow, startColumn, endColumn }
}

/**
 * Cria múltiplos merges para uma linha (útil para headers)
 */
export function createRowMerges(row: number, columnPairs: [number, number][]): MergeRange[] {
  return columnPairs.map(([start, end]) => createMerge(row, row, start, end))
}

/**
 * Cria um merge que ocupa toda a largura
 */
export function createFullWidthMerge(row: number, totalColumns: number): MergeRange {
  return createMerge(row, row, 0, totalColumns - 1)
}

/**
 * Formata um número com separador de milhares
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR")
}

/**
 * Formata um valor decimal com casas decimais específicas
 */
export function formatDecimal(value: number, decimals = 2): string {
  return value.toFixed(decimals)
}

/**
 * Cria uma linha de dados com valores formatados
 */
export function createDataRow(values: (string | number | null)[]): (string | null)[] {
  return values.map((v) => {
    if (v === null || v === undefined) return null
    if (typeof v === "number") return v.toString()
    return v
  })
}

/**
 * Adiciona emojis a headers para melhor visualização
 */
export const EMOJI_ICONS = {
  // Natureza
  plant: "🌱",
  leaf: "🍃",
  tree: "🌳",
  wood: "🪵",
  fire: "🔥",

  // Medidas
  scale: "⚖️",
  ruler: "📐",

  // Dados
  chart: "📊",
  calendar: "📅",
  people: "👥",
  droplet: "💧",
  bottle: "🍶",

  // Ações
  check: "✅",
  pin: "📌",
  link: "🔗",

  // Símbolos
  arrow: "📈",
  flask: "⚗️",
} as const

/**
 * Cria um header com emoji
 */
export function createHeaderWithIcon(icon: keyof typeof EMOJI_ICONS, text: string): string {
  return `${EMOJI_ICONS[icon]} ${text}`
}
