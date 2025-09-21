import type { EntityKey } from "@/domains/entityKeys"

export type EntityFieldDataType = "text" | "email" | "number" | "user"

export type EntityFieldDefinition = {
  id: string
  label: string
  description?: string
  placeholder?: string
  dataType: EntityFieldDataType
  autoComplete?: string
  kind: "core" | "custom"
  requiredBySystem: boolean
  defaultRequired: boolean
  createdAt: string
  createdBy: number
}

export type CreateFieldInput = {
  label: string
  dataType: Exclude<EntityFieldDataType, "user">
  description?: string
  placeholder?: string
}

export type UpdateFieldInput = {
  label?: string
  description?: string
  placeholder?: string
}

export interface EntityFieldService {
  list(entity: EntityKey): Promise<EntityFieldDefinition[]>
  create(entity: EntityKey, input: CreateFieldInput): Promise<EntityFieldDefinition>
  update(
    entity: EntityKey,
    id: string,
    patch: UpdateFieldInput,
  ): Promise<EntityFieldDefinition>
  remove(entity: EntityKey, id: string): Promise<void>
}
