import { z } from 'zod'

export const kalkulationSchema = z.object({
  name: z
    .string()
    .min(1, 'Kalkulationsname ist erforderlich')
    .max(100, 'Kalkulationsname darf maximal 100 Zeichen lang sein'),
  datum: z
    .string()
    .min(1, 'Datum ist erforderlich'),
  status: z.enum(['entwurf', 'final']).default('entwurf'),
stundenlohn: z
  .number({error: 'Stundenlohn muss eine Zahl sein'})
  .min(0, 'Stundenlohn kann nicht negativ sein')
  .max(999, 'Stundenlohn ist zu hoch'),
malnehmer: z
  .number({error: 'Malnehmer muss eine Zahl sein'})
  .min(0, 'Malnehmer kann nicht negativ sein')
  .max(10, 'Malnehmer ist zu hoch'),
  projekt_id: z.string().min(1, 'Projekt ist erforderlich'),
})

export type KalkulationFormData = z.infer<typeof kalkulationSchema>