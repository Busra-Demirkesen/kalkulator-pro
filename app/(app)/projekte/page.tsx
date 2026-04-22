'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjekte } from '@/hooks/useProjekte'
import Modal from '@/components/ui/Modal'
import ProjektForm from '@/components/ui/ProjektForm'
import type { Projekt } from '@/types'
import type { ProjektFormData } from '@/lib/validations/projekt.schema'

export default function ProjektePage() {
  const router = useRouter()
  const { projekte, isLoading, createProjekt, updateProjekt, deleteProjekt, isCreating, isUpdating } = useProjekte()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProjekt, setEditingProjekt] = useState<Projekt | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleCreate = (data: ProjektFormData) => {
    createProjekt(data, {
      onSuccess: () => setIsCreateModalOpen(false),
    })
  }

  const handleUpdate = (data: ProjektFormData) => {
    if (!editingProjekt) return
    updateProjekt(
      { id: editingProjekt.id, data },
      { onSuccess: () => setEditingProjekt(null) }
    )
  }

  const handleDelete = (id: string) => {
    if (!confirm('Möchten Sie dieses Projekt wirklich löschen?')) return
    setDeletingId(id)
    deleteProjekt(id, {
      onSuccess: () => setDeletingId(null),
      onError: () => setDeletingId(null),
    })
  }

  return (
    <div className="min-h-screen bg-[#0f1117] p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-wide">PROJEKTE</h1>
          <p className="text-[#555] text-sm mt-1">
            {projekte.length} {projekte.length === 1 ? 'Projekt' : 'Projekte'}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#f5c842] hover:bg-[#f5c842]/90 text-[#0f1117] font-bold rounded-lg px-5 py-2.5 text-sm tracking-wider transition-colors"
        >
          + NEUES PROJEKT
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-[#555] text-sm">Wird geladen...</div>
        </div>
      )}

      {/* Boş durum */}
      {!isLoading && projekte.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-[#2a2d3e] text-6xl mb-4">◫</div>
          <p className="text-[#555] text-sm mb-4">Noch keine Projekte vorhanden</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-[#f5c842] text-sm hover:underline"
          >
            Erstes Projekt erstellen
          </button>
        </div>
      )}

      {/* Proje listesi */}
      {!isLoading && projekte.length > 0 && (
        <div className="grid gap-4">
          {projekte.map((projekt) => (
            <div
              key={projekt.id}
              className="bg-[#13151c] border border-[#1e2130] rounded-xl p-6 flex items-center justify-between group hover:border-[#2a2d3e] transition-colors"
            >
              {/* Sol taraf — proje bilgileri */}
              <div
                className="flex-1 cursor-pointer"
                onClick={() => router.push(`/projekte/${projekt.id}`)}
              >
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-white font-semibold">{projekt.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    projekt.status === 'aktiv'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-[#1e2130] text-[#555]'
                  }`}>
                    {projekt.status === 'aktiv' ? 'Aktiv' : 'Archiviert'}
                  </span>
                </div>
                {projekt.beschreibung && (
                  <p className="text-[#555] text-sm">{projekt.beschreibung}</p>
                )}
                <p className="text-[#333] text-xs mt-2">
                  {new Date(projekt.created_at).toLocaleDateString('de-DE')}
                </p>
              </div>

              {/* Sağ taraf — aksiyonlar */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingProjekt(projekt)}
                  className="bg-[#1e2130] hover:bg-[#2a2d3e] text-[#888] rounded-lg px-3 py-2 text-xs transition-colors"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => handleDelete(projekt.id)}
                  disabled={deletingId === projekt.id}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg px-3 py-2 text-xs transition-colors disabled:opacity-50"
                >
                  {deletingId === projekt.id ? '...' : 'Löschen'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Proje oluştur modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Neues Projekt"
      >
        <ProjektForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isCreating}
        />
      </Modal>

      {/* Proje düzenle modal */}
      <Modal
        isOpen={!!editingProjekt}
        onClose={() => setEditingProjekt(null)}
        title="Projekt bearbeiten"
      >
        <ProjektForm
          onSubmit={handleUpdate}
          onCancel={() => setEditingProjekt(null)}
          defaultValues={editingProjekt ?? undefined}
          isLoading={isUpdating}
        />
      </Modal>

    </div>
  )
}