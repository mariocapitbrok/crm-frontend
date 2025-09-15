import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { EntityKey } from "@/entities/registry"
import { useApi } from "@/febe"
import type { SavedView, ViewDefinition } from "@/febe/types"

const qk = {
  savedViews: (entity: EntityKey) => ["saved_views", entity] as const,
}

export function useSavedViews(entity: EntityKey) {
  const api = useApi()
  return useQuery({
    queryKey: qk.savedViews(entity),
    queryFn: () => api.savedViews.list(entity),
  })
}

export function useCreateSavedView() {
  const api = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      entity: EntityKey
      name: string
      scope?: "personal" | "shared"
      isDefault?: boolean
      definition: ViewDefinition
    }) => api.savedViews.create(input),
    onSuccess: (res: SavedView) => {
      qc.invalidateQueries({ queryKey: qk.savedViews(res.entity) })
    },
  })
}

export function useUpdateSavedView() {
  const api = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: number
      patch: Partial<Pick<SavedView, "name" | "scope" | "isDefault" | "definition">>
    }) => api.savedViews.update(input.id, input.patch),
    onSuccess: (res: SavedView) => {
      qc.invalidateQueries({ queryKey: qk.savedViews(res.entity) })
    },
  })
}

export function useDeleteSavedView() {
  const api = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: number; entity: EntityKey }) => api.savedViews.remove(input.id),
    onSuccess: (_void, vars) => {
      qc.invalidateQueries({ queryKey: qk.savedViews(vars.entity) })
    },
  })
}

