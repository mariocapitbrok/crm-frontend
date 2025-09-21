import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { EntityKey } from "@/domains/entityKeys"
import type {
  CreateFieldInput,
  EntityFieldDefinition,
} from "@/febe/entityFields"
import { useApi } from "@/febe"

const queryKey = (entity: EntityKey) => ["entity-fields", entity]

export function useEntityFields(entity: EntityKey) {
  const api = useApi()
  return useQuery({
    queryKey: queryKey(entity),
    queryFn: () => api.entityFields.list(entity),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateEntityField(entity: EntityKey) {
  const api = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateFieldInput) => api.entityFields.create(entity, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(entity) })
    },
  })
}

export function useRemoveEntityField(entity: EntityKey) {
  const api = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (fieldId: string) => api.entityFields.remove(entity, fieldId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(entity) })
    },
  })
}

export type { EntityFieldDefinition }
