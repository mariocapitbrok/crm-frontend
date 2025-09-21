import { getCurrentPrincipal } from "../auth"
import type {
  FieldConfig,
  FieldConfigService,
  FieldConfigUpdateInput,
} from "../fieldConfig"
import type { EntityKey } from "@/domains/entityKeys"

type StoredConfig = {
  requiredFieldIds: string[]
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

function normalizeRequiredFieldIds(ids: string[]): string[] {
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
      const requiredFieldIds = normalizeRequiredFieldIds(
        input.requiredFieldIds,
      )
      if (requiredFieldIds.length === 0) {
        throw new Error("Select at least one required field")
      }
      const stored: StoredConfig = {
        requiredFieldIds,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      }
      tenantStore.set(entity, stored)
      return {
        entity,
        requiredFieldIds: [...stored.requiredFieldIds],
        updatedAt: stored.updatedAt,
        updatedBy: stored.updatedBy,
      }
    },
  }
}

