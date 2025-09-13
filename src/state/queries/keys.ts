export const queryKeys = {
  users: () => ["users"] as const,
  leads: (params?: Record<string, unknown>) =>
    params ? (["leads", params] as const) : (["leads"] as const),
}

