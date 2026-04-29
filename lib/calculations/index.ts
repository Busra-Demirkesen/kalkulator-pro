import type {
  KalkulationWithDetails,
  PositionWithDetails,
  UnterpositionWithWerkstoffe,
} from '@/types'

// Prisma Decimal veya number'ı güvenle sayıya çevirir
function toNum(val: unknown): number {
  if (val === null || val === undefined) return 0
  return Number(val)
}

// ─── Temel formüller ────────────────────────────────────────────────────────

// Stundenlohn / 60
export function calcMinutenlohn(stundenlohn: number): number {
  return stundenlohn / 60
}

// min_je_einheit × (Stundenlohn / 60)
export function calcLohnpreisJeEinheit(minJeEinheit: number, stundenlohn: number): number {
  return minJeEinheit * calcMinutenlohn(stundenlohn)
}

// Einkaufspreis / Malnehmer  →  malzemenin iç hesap fiyatı
export function calcBerechnung(einkaufPreis: number, malnehmer: number): number {
  if (malnehmer === 0) return 0
  return einkaufPreis / malnehmer
}

// Verbrauch × Berechnung  →  birim başına malzeme maliyeti
export function calcWerkstoffpreisJeEinheit(
  verbrauch: number,
  einkaufPreis: number,
  malnehmer: number
): number {
  return verbrauch * calcBerechnung(einkaufPreis, malnehmer)
}

// Lohnpreis + Σ Werkstoffpreise  →  bir unterpositionun birim fiyatı
export function calcPreisJeEinheit(
  unterposition: UnterpositionWithWerkstoffe,
  stundenlohn: number,
  malnehmer: number
): number {
  const lohn = calcLohnpreisJeEinheit(toNum(unterposition.min_je_einheit), stundenlohn)
  const material = unterposition.werkstoffe.reduce((sum, w) => {
    return sum + calcWerkstoffpreisJeEinheit(toNum(w.verbrauch), toNum(w.einkauf_preis), malnehmer)
  }, 0)
  return lohn + material
}

// Preis je Einheit × Massen
export function calcUnterpositionGesamtpreis(
  unterposition: UnterpositionWithWerkstoffe,
  massen: number,
  stundenlohn: number,
  malnehmer: number
): number {
  return calcPreisJeEinheit(unterposition, stundenlohn, malnehmer) * massen
}

// (min_je_einheit / 60) × Massen  →  toplam saat
export function calcGesamtzeit(minJeEinheit: number, massen: number): number {
  return (minJeEinheit / 60) * massen
}

// ─── Sonuç tipleri ──────────────────────────────────────────────────────────

export interface WerkstoffErgebnis {
  werkstoff_id: string
  name: string
  berechnung: number          // Einkauf / Malnehmer
  werkstoffpreis_je_einheit: number  // Verbrauch × Berechnung
  gesamtverbrauch: number     // Verbrauch × Massen
}

export interface UnterpositionErgebnis {
  unterposition_id: string
  label: string
  lohnpreis_je_einheit: number
  werkstoffpreis_je_einheit: number  // tüm werkstoffe toplamı
  preis_je_einheit: number
  gesamtpreis: number
  gesamtzeit: number          // saat cinsinden
  werkstoffe: WerkstoffErgebnis[]
}

export interface PositionErgebnis {
  position_id: string
  titel: string
  einheit: string | null
  massen: number
  gesamtpreis: number
  gesamtzeit: number
  unterpositionen: UnterpositionErgebnis[]
}

export interface KalkulationErgebnis {
  gesamtpreis: number
  gesamtzeit: number          // toplam saat
  positionen: PositionErgebnis[]
}

// ─── Ana hesaplama fonksiyonu ────────────────────────────────────────────────

export function berechneKalkulation(kalkulation: KalkulationWithDetails): KalkulationErgebnis {
  const stundenlohn = toNum(kalkulation.stundenlohn)
  const malnehmer = toNum(kalkulation.malnehmer)

  const positionen: PositionErgebnis[] = kalkulation.positionen.map((pos) => {
    const massen = toNum(pos.massen)

    const unterpositionen: UnterpositionErgebnis[] = pos.unterpositionen.map((up) => {
      const minJeEinheit = toNum(up.min_je_einheit)
      const lohnpreis = calcLohnpreisJeEinheit(minJeEinheit, stundenlohn)

      const werkstoffe: WerkstoffErgebnis[] = up.werkstoffe.map((w) => {
        const verbrauch = toNum(w.verbrauch)
        const einkauf = toNum(w.einkauf_preis)
        const berechnung = calcBerechnung(einkauf, malnehmer)
        return {
          werkstoff_id: w.id,
          name: w.name,
          berechnung,
          werkstoffpreis_je_einheit: verbrauch * berechnung,
          gesamtverbrauch: verbrauch * massen,
        }
      })

      const werkstoffpreisGesamt = werkstoffe.reduce(
        (sum, w) => sum + w.werkstoffpreis_je_einheit,
        0
      )
      const preisJeEinheit = lohnpreis + werkstoffpreisGesamt

      return {
        unterposition_id: up.id,
        label: up.label,
        lohnpreis_je_einheit: lohnpreis,
        werkstoffpreis_je_einheit: werkstoffpreisGesamt,
        preis_je_einheit: preisJeEinheit,
        gesamtpreis: preisJeEinheit * massen,
        gesamtzeit: calcGesamtzeit(minJeEinheit, massen),
        werkstoffe,
      }
    })

    const posGesamtpreis = unterpositionen.reduce((sum, up) => sum + up.gesamtpreis, 0)
    const posGesamtzeit = unterpositionen.reduce((sum, up) => sum + up.gesamtzeit, 0)

    return {
      position_id: pos.id,
      titel: pos.title,
      einheit: pos.einheit,
      massen,
      gesamtpreis: posGesamtpreis,
      gesamtzeit: posGesamtzeit,
      unterpositionen,
    }
  })

  return {
    gesamtpreis: positionen.reduce((sum, p) => sum + p.gesamtpreis, 0),
    gesamtzeit: positionen.reduce((sum, p) => sum + p.gesamtzeit, 0),
    positionen,
  }
}

// ─── Yardımcı formatlama fonksiyonları ──────────────────────────────────────

// 1.234,56 € formatı (Almanca)
export function formatEuro(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// 28,33 Std formatı
export function formatStunden(value: number): string {
  return `${value.toFixed(2)} Std`
}
