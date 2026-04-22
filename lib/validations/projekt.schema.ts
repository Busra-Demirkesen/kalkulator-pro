import { z } from 'zod'

export const projektSchema = z.object({
  name: z
    .string()
    .min(1, 'Projektname ist erforderlich')
    .min(2, 'Projektname muss mindestens 2 Zeichen lang sein')
    .max(100, 'Projektname darf maximal 100 Zeichen lang sein'),
  beschreibung: z
    .string()
    .max(500, 'Beschreibung darf maximal 500 Zeichen lang sein')
    .optional(),
  status: z.enum(['aktiv', 'archiviert']).default('aktiv'),
})

export type ProjektFormData = z.infer<typeof projektSchema>