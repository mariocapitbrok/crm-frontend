import { useQuery } from "@tanstack/react-query"
import { http } from "@/state/queries/client"
import { queryKeys } from "@/state/queries/keys"

export type IdentityUser = {
  id: number
  first_name: string
  last_name: string
  email: string
}

export function useIdentityUsers() {
  return useQuery({
    queryKey: queryKeys.users(),
    queryFn: () => http<IdentityUser[]>("/users"),
  })
}
