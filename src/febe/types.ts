export type TenantId = string

export type Role = "admin" | "user"

export type Principal = {
  userId: number
  tenantId: TenantId
  role: Role
}

export type ViewSort = { columnId: string; dir: "asc" | "desc" } | null

export type ViewDefinition = {
  q?: string
  filters?: Record<string, string>
  sort?: ViewSort
  visibleColumns?: string[]
  columnOrder?: string[]
  headerLayout?: "split" | "popover"
  pageSize?: number
}

export type SavedView = {
  id: number
  entity: import("@/domains/entityKeys").EntityKey
  tenantId: TenantId
  name: string
  ownerId: number
  scope?: "personal" | "shared"
  isDefault?: boolean
  definition: ViewDefinition
  createdAt: string
  updatedAt: string
  version: number
}
