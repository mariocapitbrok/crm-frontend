import { useQuery } from "@tanstack/react-query"
import { http } from "@/state/queries/client"
import { queryKeys } from "@/state/queries/keys"

export type ContactRecord = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone?: string
  title?: string
  account_id?: number
  assigned_user_id?: number
}

export function useContactDirectory() {
  return useQuery({
    queryKey: queryKeys.contacts(),
    queryFn: () => http<ContactRecord[]>("/contacts"),
  })
}
