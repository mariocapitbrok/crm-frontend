import type { EntityKey } from "@/domains/entityKeys"

export type FieldConfig = {
  entity: EntityKey
  requiredFieldIds: string[]
  visibleFieldIds: string[]
  updatedAt: string | null
  updatedBy: number | null
}

export type FieldConfigUpdateInput = {
  requiredFieldIds?: string[]
  visibleFieldIds?: string[]
}

export interface FieldConfigService {
  get(entity: EntityKey): Promise<FieldConfig | null>
  update(entity: EntityKey, input: FieldConfigUpdateInput): Promise<FieldConfig>
}
