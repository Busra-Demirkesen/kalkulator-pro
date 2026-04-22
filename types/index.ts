// types/index.ts
// Projenin tüm TypeScript tiplerini buradan export ediyoruz.

import type { Projekt, Kalkulation, Position, Unterposition, Werkstoff } from '@prisma/client'

// Prisma'nın ürettiği base tipleri re-export ediyoruz
export type { Projekt, Kalkulation, Position, Unterposition, Werkstoff }

// Kullanıcı tipi
export type UserRole = 'admin' | 'user'
export type ProjectStatus = 'aktiv' | 'archiviert'
export type KalkulationStatus = 'entwurf' | 'final'

export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
}

// Nested tipler — API'den include ile gelen veriler için
// Werkstoff ile birlikte Unterposition
export type UnterpositionWithWerkstoffe = Unterposition & {
  werkstoffe: Werkstoff[]
}

// Unterposition ve Werkstoff ile birlikte Position
export type PositionWithDetails = Position & {
  unterpositionen: UnterpositionWithWerkstoffe[]
}

// Tüm detaylarıyla Kalkulation — detay sayfasında kullanılır
export type KalkulationWithDetails = Kalkulation & {
  positionen: PositionWithDetails[]
}

// API Response tipleri
export interface ApiError {
  error: string
  details?: unknown
}

export interface ApiSuccess {
  success: true
}