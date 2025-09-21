export const entityKeys = [
  "leads",
  "contacts",
  "deals",
  "organizations",
] as const

export type EntityKey = (typeof entityKeys)[number]
