import { useQuery } from "@tanstack/react-query"
import { http } from "@/state/queries/client"
import { queryKeys } from "@/state/queries/keys"

export type OrganizationRecord = {
  id: number
  accountname: string
}

export function useOrganizationDirectory() {
  return useQuery({
    queryKey: queryKeys.organizations(),
    queryFn: () => http<OrganizationRecord[]>("/organizations"),
  })
}
