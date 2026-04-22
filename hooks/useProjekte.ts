import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Projekt } from '@/types'
import type { ProjektFormData } from '@/lib/validations/projekt.schema'

// API fonksiyonları — fetch işlemlerini buradan yapıyoruz
const api = {
  getAll: async (): Promise<Projekt[]> => {
    const res = await fetch('/api/projekte')
    if (!res.ok) throw new Error('Fehler beim Laden der Projekte')
    return res.json()
  },

  create: async (data: ProjektFormData): Promise<Projekt> => {
    const res = await fetch('/api/projekte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Fehler beim Erstellen des Projekts')
    return res.json()
  },

  update: async ({ id, data }: { id: string; data: ProjektFormData }): Promise<void> => {
    const res = await fetch(`/api/projekte/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Fehler beim Aktualisieren des Projekts')
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/projekte/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Fehler beim Löschen des Projekts')
  },
}

// Custom hook
export function useProjekte() {
  const queryClient = useQueryClient()

  // Projeleri getir
  const { data: projekte = [], isLoading, error } = useQuery({
    queryKey: ['projekte'],
    queryFn: api.getAll,
  })

  // Proje oluştur
  const createMutation = useMutation({
    mutationFn: api.create,
    onSuccess: () => {
      // Başarılı olunca proje listesini yenile
      queryClient.invalidateQueries({ queryKey: ['projekte'] })
    },
  })

  // Proje güncelle
  const updateMutation = useMutation({
    mutationFn: api.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projekte'] })
    },
  })

  // Proje sil
  const deleteMutation = useMutation({
    mutationFn: api.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projekte'] })
    },
  })

  return {
    projekte,
    isLoading,
    error,
    createProjekt: createMutation.mutate,
    updateProjekt: updateMutation.mutate,
    deleteProjekt: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}