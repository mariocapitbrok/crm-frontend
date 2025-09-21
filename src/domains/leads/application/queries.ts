import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { http } from "@/state/queries/client"
import { queryKeys } from "@/state/queries/keys"
import {
  useIdentityUsers,
  type IdentityUser,
} from "@/domains/identity/application/users"

export type LeadRecord = {
  id: number
  firstname: string
  lastname: string
  company: string
  email: string
  assigned_user_id?: number
  [key: string]: unknown
}

export function useLeadOwners() {
  return useIdentityUsers()
}

export type LeadOwner = IdentityUser

export function useLeadDirectory() {
  return useQuery({
    queryKey: queryKeys.leads(),
    queryFn: () => http<LeadRecord[]>("/leads"),
  })
}

export function useCreateLeadEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<LeadRecord>) =>
      http<LeadRecord>(`/leads`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.leads() })
    },
  })
}

export function useUpdateLeadEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<LeadRecord> & { id: number }) =>
      http<LeadRecord>(`/leads/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.leads() })
    },
  })
}
