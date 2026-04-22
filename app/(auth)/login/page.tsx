'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setServerError(null)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError('E-Mail oder Passwort ist falsch')
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#f5c842] rounded-lg flex items-center justify-center font-bold text-[#0f1117] text-lg">
            K
          </div>
          <div>
            <div className="text-white font-bold tracking-widest text-sm">KALKULATOR</div>
            <div className="text-[#555] text-xs tracking-wider">Pro v2.0</div>
          </div>
        </div>

        {/* Kart */}
        <div className="bg-[#13151c] border border-[#1e2130] rounded-xl p-8">
          <h1 className="text-white text-xl font-bold mb-1">Anmelden</h1>
          <p className="text-[#555] text-sm mb-6">Melden Sie sich mit Ihrem Konto an</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Server hatası */}
            {serverError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{serverError}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-[#888] text-xs tracking-widest uppercase block mb-2">
                E-Mail
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="ihre@email.de"
                className="w-full bg-[#0f1117] border border-[#1e2130] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#f5c842] transition-colors placeholder:text-[#333]"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Şifre */}
            <div>
              <label className="text-[#888] text-xs tracking-widest uppercase block mb-2">
                Passwort
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#0f1117] border border-[#1e2130] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#f5c842] transition-colors placeholder:text-[#333]"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#f5c842] hover:bg-[#f5c842]/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#0f1117] font-bold rounded-lg py-3 text-sm tracking-wider transition-colors mt-2"
            >
              {isLoading ? 'Wird angemeldet...' : 'ANMELDEN'}
            </button>

          </form>

          {/* Register link */}
          <p className="text-[#555] text-sm text-center mt-6">
            Noch kein Konto?{' '}
            <a href="/register" className="text-[#f5c842] hover:underline">
              Registrieren
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}