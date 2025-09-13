import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { http } from "./client"
import { queryKeys } from "./keys"

export type User = {
  id: number
  first_name: string
  last_name: string
  email: string
}

export type Lead = {
  id: number
  firstname: string
  lastname: string
  company: string
  email: string
  assigned_user_id?: number
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users(),
    queryFn: () => http<User[]>("/users"),
  })
}

export function useLeads() {
  return useQuery({
    queryKey: queryKeys.leads(),
    queryFn: () => http<Lead[]>("/leads"),
  })
}

export function useCreateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Lead>) =>
      http<Lead>(`/leads`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.leads() })
    },
  })
}

export function useUpdateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Lead> & { id: number }) =>
      http<Lead>(`/leads/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.leads() })
    },
  })
}

