import { z } from 'zod'

export const positionSchema = z.object({
  title: z
    .string()
    .min(1, 'Bezeichnung ist erforderlich')
    .max(200, 'Bezeichnung darf maximal 200 Zeichen lang sein'),
  einheit: z
    .string()
    .max(20, 'Einheit darf maximal 20 Zeichen lang sein')
    .optional(),
  massen: z
    .number({error: 'Massen muss eine Zahl sein'})
    .min(0, 'Massen kann nicht negativ sein')
    .optional(),
  kalkulation_id: z.string().min(1, 'Kalkulation ist erforderlich'),
})

export const unterpositionSchema = z.object({
  label: z
    .string()
    .min(1, 'Bezeichnung ist erforderlich')
    .max(200, 'Bezeichnung darf maximal 200 Zeichen lang sein'),
  einheit: z
    .string()
    .max(20, 'Einheit darf maximal 20 Zeichen lang sein')
    .optional(),
  min_je_einheit: z
    .number({error: 'Minuten muss eine Zahl sein'})
    .min(0, 'Minuten kann nicht negativ sein')
    .default(0),
  position_id: z.string().min(1, 'Position ist erforderlich'),
})

export const werkstoffSchema = z.object({
  name: z
    .string()
    .min(1, 'Name ist erforderlich')
    .max(100, 'Name darf maximal 100 Zeichen lang sein'),
  verbrauch: z
    .number({error: 'Verbrauch muss eine Zahl sein'})
    .min(0, 'Verbrauch kann nicht negativ sein')
    .optional(),
  einkauf_preis: z
    .number({error: 'Preis muss eine Zahl sein'})
    .min(0, 'Preis kann nicht negativ sein')
    .optional(),
  unterposition_id: z.string().min(1, 'Unterposition ist erforderlich'),
})

export type PositionFormData = z.infer<typeof positionSchema>
export type UnterpositionFormData = z.infer<typeof unterpositionSchema>
export type WerkstoffFormData = z.infer<typeof werkstoffSchema>