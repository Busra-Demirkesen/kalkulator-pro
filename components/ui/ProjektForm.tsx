'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projektSchema, type ProjektFormData } from '@/lib/validations/projekt.schema'
import type { Projekt } from '@/types'

interface ProjektFormProps {
  onSubmit: (data: ProjektFormData) => void
  onCancel: () => void
  defaultValues?: Partial<Projekt>
  isLoading?: boolean
}

export default function ProjektForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading,
}: ProjektFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjektFormData>({
    resolver: zodResolver(projektSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      beschreibung: defaultValues?.beschreibung ?? '',
      status: (defaultValues?.status as 'aktiv' | 'archiviert') ?? 'aktiv',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Proje adı */}
      <div>
        <label className="text-[#888] text-xs tracking-widest uppercase block mb-2">
          Projektname
        </label>
        <input
          {...register('name')}
          type="text"
          placeholder="z.B. U-Bahn Hamburg"
          className="w-full bg-[#0f1117] border border-[#1e2130] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#f5c842] transition-colors placeholder:text-[#333]"
        />
        {errors.name && (
          <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Açıklama */}
      <div>
        <label className="text-[#888] text-xs tracking-widest uppercase block mb-2">
          Beschreibung <span className="text-[#444]">(optional)</span>
        </label>
        <textarea
          {...register('beschreibung')}
          rows={3}
          placeholder="Kurze Beschreibung des Projekts..."
          className="w-full bg-[#0f1117] border border-[#1e2130] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#f5c842] transition-colors placeholder:text-[#333] resize-none"
        />
        {errors.beschreibung && (
          <p className="text-red-400 text-xs mt-1">{errors.beschreibung.message}</p>
        )}
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
          <option value="aktiv">Aktiv</option>
          <option value="archiviert">Archiviert</option>
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