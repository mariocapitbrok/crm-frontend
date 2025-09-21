import { getCurrentPrincipal } from "../auth"
import type {
  FieldConfig,
  FieldConfigService,
  FieldConfigUpdateInput,
} from "../fieldConfig"
import type { EntityKey } from "@/domains/entityKeys"

type StoredConfig = {
  requiredFieldIds: string[]
  visibleFieldIds: string[]
  updatedAt: string
  updatedBy: number
}

type TenantStore = Map<EntityKey, StoredConfig>

const store = new Map<string, TenantStore>()

function ensureTenantStore(tenantId: string): TenantStore {
  if (!store.has(tenantId)) {
    store.set(tenantId, new Map<EntityKey, StoredConfig>())
  }
  return store.get(tenantId)!
}

function normalizeFieldIds(ids?: string[]): string[] {
  if (!ids) return []
  const next: string[] = []
  const seen = new Set<string>()
  ids.forEach((id) => {
    const trimmed = id.trim()
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed)
      next.push(trimmed)
    }
  })
  return next
}

export function createInMemoryFieldConfig(): FieldConfigService {
  return {
    async get(entity: EntityKey): Promise<FieldConfig | null> {
      const { tenantId } = getCurrentPrincipal()
      const tenantStore = ensureTenantStore(tenantId)
      const stored = tenantStore.get(entity)
      if (!stored) return null
      return {
        entity,
        requiredFieldIds: [...stored.requiredFieldIds],
        visibleFieldIds: [...stored.visibleFieldIds],
        updatedAt: stored.updatedAt,
        updatedBy: stored.updatedBy,
      }
    },
    async update(
      entity: EntityKey,
      input: FieldConfigUpdateInput,
    ): Promise<FieldConfig> {
      const { tenantId, userId } = getCurrentPrincipal()
      const tenantStore = ensureTenantStore(tenantId)
      const existing = tenantStore.get(entity) ?? {
        requiredFieldIds: [],
        visibleFieldIds: [],
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      }

      const nextRequired = normalizeFieldIds(
        input.requiredFieldIds ?? existing.requiredFieldIds,
      )
      if (nextRequired.length === 0) {
        throw new Error("Select at least one required field")
      }

      const nextVisible = normalizeFieldIds(
        input.visibleFieldIds ?? existing.visibleFieldIds,
      )
      if (nextVisible.length === 0) {
        throw new Error("Select at least one default-visible field")
      }

      // Ensure required fields are always visible
      nextRequired.forEach((id) => {
        if (!nextVisible.includes(id)) {
          nextVisible.push(id)
        }
      })

      const stored: StoredConfig = {
        requiredFieldIds: nextRequired,
        visibleFieldIds: nextVisible,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      }
      tenantStore.set(entity, stored)
      return {
        entity,
        requiredFieldIds: [...stored.requiredFieldIds],
        visibleFieldIds: [...stored.visibleFieldIds],
        updatedAt: stored.updatedAt,
        updatedBy: stored.updatedBy,
      }
    },
  }
}
