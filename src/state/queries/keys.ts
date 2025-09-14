export const queryKeys = {
  users: () => ["users"] as const,
  leads: (params?: Record<string, unknown>) =>
    params ? (["leads", params] as const) : (["leads"] as const),
  contacts: (params?: Record<string, unknown>) =>
    params ? (["contacts", params] as const) : (["contacts"] as const),
  organizations: (params?: Record<string, unknown>) =>
    params ? (["organizations", params] as const) : (["organizations"] as const),
}
