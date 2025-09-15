import type { SavedView, ViewDefinition } from "./types"
import type { EntityKey } from "@/entities/registry"

export type ListViewsOptions = {
  ownerOnly?: boolean
}

export interface SavedViewsService {
  list(entity: EntityKey, opts?: ListViewsOptions): Promise<SavedView[]>
  create(input: {
    entity: EntityKey
    name: string
    scope?: "personal" | "shared"
    isDefault?: boolean
    definition: ViewDefinition
  }): Promise<SavedView>
  update(id: number, patch: Partial<Pick<SavedView, "name" | "scope" | "isDefault" | "definition">>): Promise<SavedView>
  remove(id: number): Promise<void>
}

