import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-Mail ist erforderlich')
    .email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  password: z
    .string()
    .min(1, 'Passwort ist erforderlich')
    .min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein'),
})

export const registerSchema = loginSchema.extend({
  full_name: z
    .string()
    .min(1, 'Name ist erforderlich')
    .min(2, 'Der Name muss mindestens 2 Zeichen lang sein'),
  confirmPassword: z.string().min(1, 'Passwortbestätigung ist erforderlich'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Die Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>