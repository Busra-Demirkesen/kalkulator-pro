'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProjekte } from '@/hooks/useProjekte'
import { useKalkulation } from '@/hooks/useKalkulation'
import Modal from '@/components/ui/Modal'
import KalkulationForm from '@/components/ui/KalkulationForm'
import type { Kalkulation } from '@/types'
import type { KalkulationFormData } from '@/lib/validations/kalkulation.schema'

export default function ProjektDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  // Proje bilgisi — listeden buluyoruz
  const { projekte } = useProjekte()
  const projekt = projekte.find((p) => p.id === id)

  // Kalkulation CRUD
  const {
    kalkulationen,
    isLoading,
    createKalkulation,
    updateKalkulation,
    deleteKalkulation,
    isCreating,
    isUpdating,
  } = useKalkulation(id)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingKalkulation, setEditingKalkulation] = useState<Kalkulation | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleCreate = (data: KalkulationFormData) => {
    createKalkulation(data, {
      onSuccess: () => setIsCreateModalOpen(false),
    })
  }

  const handleUpdate = (data: KalkulationFormData) => {
    if (!editingKalkulation) return
    updateKalkulation(
      { id: editingKalkulation.id, data },
      { onSuccess: () => setEditingKalkulation(null) }
    )
  }

  const handleDelete = (kalId: string) => {
    if (!confirm('Möchten Sie diese Kalkulation wirklich löschen?')) return
    setDeletingId(kalId)
    deleteKalkulation(kalId, {
      onSuccess: () => setDeletingId(null),
      onError: () => setDeletingId(null),
    })
  }

  return (
    <div className="min-h-screen bg-[#0f1117] p-8">

      {/* Breadcrumb + geri butonu */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button
          onClick={() => router.push('/projekte')}
          className="text-[#555] hover:text-white transition-colors"
        >
          Projekte
        </button>
        <span className="text-[#333]">/</span>
        <span className="text-white">{projekt?.name ?? '...'}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-white text-2xl font-bold tracking-wide">
              {projekt?.name ?? '...'}
            </h1>
            {projekt && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                projekt.status === 'aktiv'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-[#1e2130] text-[#555]'
              }`}>
                {projekt.status === 'aktiv' ? 'Aktiv' : 'Archiviert'}
              </span>
            )}
          </div>
          {projekt?.beschreibung && (
            <p className="text-[#555] text-sm">{projekt.beschreibung}</p>
          )}
          <p className="text-[#333] text-xs mt-2">
            {kalkulationen.length}{' '}
            {kalkulationen.length === 1 ? 'Kalkulation' : 'Kalkulationen'}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#f5c842] hover:bg-[#f5c842]/90 text-[#0f1117] font-bold rounded-lg px-5 py-2.5 text-sm tracking-wider transition-colors"
        >
          + NEUE KALKULATION
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-[#555] text-sm">Wird geladen...</div>
        </div>
      )}

      {/* Boş durum */}
      {!isLoading && kalkulationen.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-[#2a2d3e] text-6xl mb-4">◫</div>
          <p className="text-[#555] text-sm mb-4">Noch keine Kalkulationen vorhanden</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-[#f5c842] text-sm hover:underline"
          >
            Erste Kalkulation erstellen
          </button>
        </div>
      )}

      {/* Kalkulation listesi */}
      {!isLoading && kalkulationen.length > 0 && (
        <div className="grid gap-4">
          {kalkulationen.map((kal) => (
            <div
              key={kal.id}
              className="bg-[#13151c] border border-[#1e2130] rounded-xl p-6 flex items-center justify-between group hover:border-[#2a2d3e] transition-colors"
            >
              {/* Sol taraf — bilgiler */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-white font-semibold">{kal.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    kal.status === 'final'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-[#1e2130] text-[#555]'
                  }`}>
                    {kal.status === 'final' ? 'Final' : 'Entwurf'}
                  </span>
                </div>

                {/* Sayısal değerler */}
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-[#444] text-xs uppercase tracking-wider">Stundenlohn</span>
                    <p className="text-[#f5c842] font-mono font-bold">
                      {Number(kal.stundenlohn).toFixed(2)} €
                    </p>
                  </div>
                  <div>
                    <span className="text-[#444] text-xs uppercase tracking-wider">Malnehmer</span>
                    <p className="text-white font-mono">
                      {Number(kal.malnehmer).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#444] text-xs uppercase tracking-wider">Datum</span>
                    <p className="text-[#888]">
                      {new Date(kal.datum).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sağ taraf — aksiyonlar */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingKalkulation(kal)}
                  className="bg-[#1e2130] hover:bg-[#2a2d3e] text-[#888] rounded-lg px-3 py-2 text-xs transition-colors"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => handleDelete(kal.id)}
                  disabled={deletingId === kal.id}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg px-3 py-2 text-xs transition-colors disabled:opacity-50"
                >
                  {deletingId === kal.id ? '...' : 'Löschen'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kalkulation oluştur modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Neue Kalkulation"
      >
        <KalkulationForm
          projektId={id}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isCreating}
        />
      </Modal>

      {/* Kalkulation düzenle modal */}
      <Modal
        isOpen={!!editingKalkulation}
        onClose={() => setEditingKalkulation(null)}
        title="Kalkulation bearbeiten"
      >
        <KalkulationForm
          projektId={id}
          onSubmit={handleUpdate}
          onCancel={() => setEditingKalkulation(null)}
          defaultValues={editingKalkulation ?? undefined}
          isLoading={isUpdating}
        />
      </Modal>

    </div>
  )
}
