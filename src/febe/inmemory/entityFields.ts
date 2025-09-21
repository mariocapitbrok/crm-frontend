import { getCurrentPrincipal } from "../auth"
import type {
  CreateFieldInput,
  EntityFieldDefinition,
  EntityFieldService,
  UpdateFieldInput,
} from "../entityFields"
import type { EntityKey } from "@/domains/entityKeys"
import {
  coreLeadFieldDefinitions,
  type LeadFieldDefinition,
} from "@/domains/leads/domain/leadSchemas"

const coreSeeds: Record<EntityKey, LeadFieldDefinition[]> = {
  leads: coreLeadFieldDefinitions,
  contacts: [],
  deals: [],
}

type StoredField = EntityFieldDefinition & { entity: EntityKey }

type TenantStore = Map<EntityKey, StoredField[]>

const store = new Map<string, TenantStore>()

function ensureTenantStore(tenantId: string): TenantStore {
  if (!store.has(tenantId)) {
    const tenantStore: TenantStore = new Map()
    store.set(tenantId, tenantStore)

    Object.entries(coreSeeds).forEach(([entityKey, definitions]) => {
      if (!definitions.length) return
      tenantStore.set(
        entityKey as EntityKey,
        definitions.map((definition) => seedToField(entityKey as EntityKey, definition)),
      )
    })
  }
  return store.get(tenantId)!
}

function seedToField(entity: EntityKey, def: LeadFieldDefinition): StoredField {
  const now = new Date().toISOString()
  return {
    id: def.id,
    label: def.label,
    description: def.description,
    placeholder: def.placeholder,
    dataType: def.dataType,
    autoComplete: def.autoComplete,
    kind: def.kind,
    requiredBySystem: def.kind === "core",
    defaultRequired: Boolean(def.defaultRequired),
    createdAt: now,
    createdBy: 0,
    entity,
  }
}

function normalizeId(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function ensureUniqueId(
  desiredId: string,
  collection: StoredField[],
): string {
  let candidate = desiredId
  let i = 1
  while (collection.some((field) => field.id === candidate)) {
    candidate = `${desiredId}_${i}`
    i += 1
  }
  return candidate
}

export function createInMemoryEntityFields(): EntityFieldService {
  return {
    async list(entity: EntityKey) {
      const { tenantId } = getCurrentPrincipal()
      const tenantStore = ensureTenantStore(tenantId)
      if (!tenantStore.has(entity)) {
        tenantStore.set(entity, [])
      }
      return [...(tenantStore.get(entity) ?? [])].map(stripEntity)
    },
    async create(entity: EntityKey, input: CreateFieldInput) {
      const { tenantId, userId } = getCurrentPrincipal()
      const tenantStore = ensureTenantStore(tenantId)
      const all = tenantStore.get(entity) ?? []

      if (!input.label.trim()) {
        throw new Error("Label is required")
      }

      const rawId = normalizeId(input.label)
      if (!rawId) {
        throw new Error("Label must contain alphanumeric characters")
      }

      const id = ensureUniqueId(
        input.dataType === "email" ? `${rawId}_email` : `custom_${rawId}`,
        all,
      )

      const now = new Date().toISOString()
      const field: StoredField = {
        id,
        label: input.label.trim(),
        description: input.description?.trim(),
        placeholder: input.placeholder?.trim(),
        dataType: input.dataType,
        autoComplete: undefined,
        kind: "custom",
        requiredBySystem: false,
        defaultRequired: false,
        createdAt: now,
        createdBy: userId,
        entity,
      }

      tenantStore.set(entity, [...all, field])
      return stripEntity(field)
    },
    async update(entity: EntityKey, id: string, patch: UpdateFieldInput) {
      const { tenantId } = getCurrentPrincipal()
      const tenantStore = ensureTenantStore(tenantId)
      const all = tenantStore.get(entity) ?? []
      const idx = all.findIndex((field) => field.id === id)
      if (idx === -1) throw new Error("Field not found")

      const existing = all[idx]
      if (existing.requiredBySystem) {
        throw new Error("System fields cannot be edited")
      }

      const next: StoredField = {
        ...existing,
        label: patch.label?.trim() || existing.label,
        description: patch.description?.trim() ?? existing.description,
        placeholder: patch.placeholder?.trim() ?? existing.placeholder,
      }

      all[idx] = next
      tenantStore.set(entity, [...all])
      return stripEntity(next)
    },
    async remove(entity: EntityKey, id: string) {
      const { tenantId } = getCurrentPrincipal()
      const tenantStore = ensureTenantStore(tenantId)
      const all = tenantStore.get(entity) ?? []
      const idx = all.findIndex((field) => field.id === id)
      if (idx === -1) return

      if (all[idx].requiredBySystem) {
        throw new Error("System fields cannot be removed")
      }

      all.splice(idx, 1)
      tenantStore.set(entity, [...all])
    },
  }
}

function stripEntity(field: StoredField): EntityFieldDefinition {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { entity, ...rest } = field
  return rest
}
