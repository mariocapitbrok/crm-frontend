import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { EntityKey } from "@/domains/entityKeys"
import type {
  FieldConfig,
  FieldConfigUpdateInput,
} from "@/febe/fieldConfig"
import { useApi } from "@/febe"

const queryKey = (entity: EntityKey) => ["entity-field-config", entity]

export type ResolvedFieldConfig = FieldConfig & {
  isFallback: boolean
}

export function useEntityFieldConfig(
  entity: EntityKey,
  defaults: { requiredFieldIds: string[] },
) {
  const api = useApi()
  return useQuery({
    queryKey: queryKey(entity),
    queryFn: async (): Promise<ResolvedFieldConfig> => {
      const result = await api.fieldConfig.get(entity)
      if (!result) {
        return {
          entity,
          requiredFieldIds: [...defaults.requiredFieldIds],
          updatedAt: null,
          updatedBy: null,
          isFallback: true,
        }
      }
      return { ...result, isFallback: false }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateEntityFieldConfig(entity: EntityKey) {
  const api = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: FieldConfigUpdateInput) =>
      api.fieldConfig.update(entity, input),
    onSuccess: (data) => {
      const resolved: ResolvedFieldConfig = { ...data, isFallback: false }
      qc.setQueryData(queryKey(entity), resolved)
    },
  })
}

