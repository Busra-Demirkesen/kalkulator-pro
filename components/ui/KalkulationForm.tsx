'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { kalkulationSchema, type KalkulationFormData } from '@/lib/validations/kalkulation.schema'
import type { Kalkulation } from '@/types'

interface KalkulationFormProps {
  projektId: string
  onSubmit: (data: KalkulationFormData) => void
  onCancel: () => void
  defaultValues?: Partial<Kalkulation>
  isLoading?: boolean
}

export default function KalkulationForm({
  projektId,
  onSubmit,
  onCancel,
  defaultValues,
  isLoading,
}: KalkulationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KalkulationFormData>({
    resolver: zodResolver(kalkulationSchema),
    defaultValues: {
      projekt_id: projektId,
      name: defaultValues?.name ?? '',
      datum: defaultValues?.datum
        ? new Date(defaultValues.datum).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      status: (defaultValues?.status as 'entwurf' | 'final') ?? 'entwurf',
      stundenlohn: defaultValues?.stundenlohn
        ? Number(defaultValues.stundenlohn)
        : 0,
      malnehmer: defaultValues?.malnehmer
        ? Number(defaultValues.malnehmer)
        : 0.7,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* projekt_id gizli alan — kullanıcı görmez, form ile birlikte gider */}
      <input type="hidden" {...register('projekt_id')} />

      {/* Kalkulation adı */}
      <div>
        <label className="text-[#888] text-xs tracking-widest uppercase block mb-2">
          Kalkulationsname
        </label>
        <input
          {...register('name')}
          type="text"
          placeholder="z.B. Vorkalkulation 2026"
          className="w-full bg-[#0f1117] border border-[#1e2130] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#f5c842] transition-colors placeholder:text-[#333]"
        />
        {errors.name && (
          <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Tarih */}
      <div>
        <label className="text-[#888] text-xs tracking-widest uppercase block mb-2">
          Datum
        </label>
        <input
          {...register('datum')}
          type="date"
          className="w-full bg-[#0f1117] border border-[#1e2130] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#f5c842] transition-colors [color-scheme:dark]"
        />
        {errors.datum && (
          <p className="text-red-400 text-xs mt-1">{errors.datum.message}</p>
        )}
      </div>

      {/* Stundenlohn ve Malnehmer — yan yana */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[#888] text-xs tracking-widest uppercase block mb-2">
            Stundenlohn (€)
          </label>
          <input
            {...register('stundenlohn', { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full bg-[#0f1117] border border-[#1e2130] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#f5c842] transition-colors placeholder:text-[#333]"
          />
          {errors.stundenlohn && (
            <p className="text-red-400 text-xs mt-1">{errors.stundenlohn.message}</p>
          )}
        </div>

        <div>
          <label className="text-[#888] text-xs tracking-widest uppercase block mb-2">
            Malnehmer
          </label>
          <input
            {...register('malnehmer', { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0"
            max="10"
            placeholder="0.70"
            className="w-full bg-[#0f1117] border border-[#1e2130] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#f5c842] transition-colors placeholder:text-[#333]"
          />
          {errors.malnehmer && (
            <p className="text-red-400 text-xs mt-1">{errors.malnehmer.message}</p>
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="text-[#888] text-xs tracking-widest uppercase block mb-2">
          Status
        </label>
        <select
          {...register('status')}
          className="w-full bg-[#0f1117] border border-[#1e2130] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#f5c842] transition-colors"
        >
          <option value="entwurf">Entwurf</option>
          <option value="final">Final</option>
        </select>
      </div>

      {/* Butonlar */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-[#1e2130] hover:bg-[#2a2d3e] text-[#888] rounded-lg py-3 text-sm transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-[#f5c842] hover:bg-[#f5c842]/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#0f1117] font-bold rounded-lg py-3 text-sm transition-colors"
        >
          {isLoading ? 'Wird gespeichert...' : 'Speichern'}
        </button>
      </div>

    </form>
  )
}
