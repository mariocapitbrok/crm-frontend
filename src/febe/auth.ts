import type { Principal, Role, TenantId } from "./types"

// Dev-only principal. In a real app, this would come from auth.
let current: Principal = {
  userId: 1,
  tenantId: "demo" as TenantId,
  role: "admin" as Role,
}

export function getCurrentPrincipal(): Principal {
  return current
}

export function setCurrentPrincipal(p: Partial<Principal>) {
  current = { ...current, ...p }
}

