import type React from "react"
export type ViewType = "all" | "region" | "nucleo" | null

export interface RegionSelectorProps {
  navigation?: any
}

export interface StatsCardProps {
  totalNucleos: number
  totalRegioes: number
}

export interface ViewOptionProps {
  icon: React.ReactNode
  title: string
  description: string
  onPress: () => void
  backgroundColor: string
}

export interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder: string
}

export interface RegionListItemProps {
  id: string
  nome: string
  onPress: () => void
}

export interface NucleoListItemProps {
  id: string
  nome: string
  regionName?: string
  onPress: () => void
}
