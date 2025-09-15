import { getCurrentPrincipal } from "../auth"
import type { SavedViewsService } from "../savedViews"
import type { EntityKey } from "@/entities/registry"
import type { SavedView, ViewDefinition } from "../types"

type Store = Map<string, SavedView[]> // key: tenantId

const store: Store = new Map()
let nextId = 9000

function isoNow() {
  return new Date().toISOString()
}

function ensureTenant(tenantId: string) {
  if (!store.has(tenantId)) store.set(tenantId, [])
}

function validateDefinition(def: ViewDefinition) {
  if (def.visibleColumns && def.visibleColumns.length === 0) {
    throw new Error("At least one visible column is required")
  }
}

export function createInMemorySavedViews(): SavedViewsService {
  return {
    async list(entity: EntityKey) {
      const { tenantId, userId, role } = getCurrentPrincipal()
      ensureTenant(tenantId)
      const all = store.get(tenantId)!
      // Everyone sees shared; personal only if owner
      return all.filter((v) => v.entity === entity && (v.scope === "shared" || v.ownerId === userId || role === "admin"))
    },
    async create(input) {
      const { tenantId, userId, role } = getCurrentPrincipal()
      ensureTenant(tenantId)
      if (input.scope === "shared" && role !== "admin") {
        throw new Error("Only admins can create shared views")
      }
      validateDefinition(input.definition)
      const now = isoNow()
      const v: SavedView = {
        id: nextId++,
        entity: input.entity,
        tenantId,
        name: input.name.trim(),
        ownerId: userId,
        scope: input.scope ?? "personal",
        isDefault: input.isDefault ?? false,
        definition: input.definition,
        createdAt: now,
        updatedAt: now,
        version: 1,
      }
      const list = store.get(tenantId)!
      // Optional: unique name per tenant+entity
      if (list.some((sv) => sv.entity === v.entity && sv.name.toLowerCase() === v.name.toLowerCase())) {
        throw new Error("A view with this name already exists for this entity")
      }
      // If marking as default, unset others for same entity
      if (v.isDefault) {
        for (const sv of list) if (sv.entity === v.entity) sv.isDefault = false
      }
      list.push(v)
      return v
    },
    async update(id, patch) {
      const { tenantId, userId, role } = getCurrentPrincipal()
      ensureTenant(tenantId)
      const list = store.get(tenantId)!
      const idx = list.findIndex((v) => v.id === id)
      if (idx < 0) throw new Error("View not found")
      const current = list[idx]
      const isOwner = current.ownerId === userId
      const isShared = (patch.scope ?? current.scope) === "shared"
      if (isShared && role !== "admin") throw new Error("Only admins can update shared views")
      if (!isOwner && role !== "admin") throw new Error("Only owner or admin can update this view")
      const next: SavedView = {
        ...current,
        ...("name" in patch ? { name: patch.name!.trim() } : {}),
        ...("scope" in patch ? { scope: patch.scope } : {}),
        ...("isDefault" in patch ? { isDefault: patch.isDefault } : {}),
        ...("definition" in patch ? { definition: patch.definition! } : {}),
        updatedAt: isoNow(),
        version: current.version + 1,
      }
      if (patch.definition) validateDefinition(patch.definition)
      // Optional: unique name per tenant+entity
      if (
        patch.name &&
        list.some((sv) => sv.id !== id && sv.entity === next.entity && sv.name.toLowerCase() === patch.name!.trim().toLowerCase())
      ) {
        throw new Error("A view with this name already exists for this entity")
      }
      if (next.isDefault) {
        for (const sv of list) if (sv.entity === next.entity && sv.id !== next.id) sv.isDefault = false
      }
      list[idx] = next
      return next
    },
    async remove(id) {
      const { tenantId, userId, role } = getCurrentPrincipal()
      ensureTenant(tenantId)
      const list = store.get(tenantId)!
      const idx = list.findIndex((v) => v.id === id)
      if (idx < 0) return
      const current = list[idx]
      const isOwner = current.ownerId === userId
      if (!isOwner && role !== "admin") throw new Error("Only owner or admin can delete this view")
      list.splice(idx, 1)
    },
  }
}

