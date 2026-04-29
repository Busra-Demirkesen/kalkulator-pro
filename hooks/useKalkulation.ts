import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Kalkulation } from '@/types'
import type { KalkulationFormData } from '@/lib/validations/kalkulation.schema'

const api = {
  getAll: async (projektId: string): Promise<Kalkulation[]> => {
    const res = await fetch(`/api/kalkulationen?projekt_id=${projektId}`)
    if (!res.ok) throw new Error('Fehler beim Laden der Kalkulationen')
    return res.json()
  },

  create: async (data: KalkulationFormData): Promise<Kalkulation> => {
    const res = await fetch('/api/kalkulationen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Fehler beim Erstellen der Kalkulation')
    return res.json()
  },

  update: async ({ id, data }: { id: string; data: KalkulationFormData }): Promise<void> => {
    const res = await fetch(`/api/kalkulationen/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Fehler beim Aktualisieren der Kalkulation')
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/kalkulationen/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Fehler beim Löschen der Kalkulation')
  },
}

export function useKalkulation(projektId: string) {
  const queryClient = useQueryClient()

  const { data: kalkulationen = [], isLoading, error } = useQuery({
    queryKey: ['kalkulationen', projektId],
    queryFn: () => api.getAll(projektId),
    enabled: !!projektId,
  })

  const createMutation = useMutation({
    mutationFn: api.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kalkulationen', projektId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: api.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kalkulationen', projektId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: api.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kalkulationen', projektId] })
    },
  })

  return {
    kalkulationen,
    isLoading,
    error,
    createKalkulation: createMutation.mutate,
    updateKalkulation: updateMutation.mutate,
    deleteKalkulation: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
