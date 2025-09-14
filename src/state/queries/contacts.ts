import { useQuery } from "@tanstack/react-query"
import { http } from "./client"
import { queryKeys } from "./keys"

export type Organization = {
  id: number
  accountname: string
}

export type Contact = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone?: string
  title?: string
  account_id?: number
  assigned_user_id?: number
}

export function useContacts() {
  return useQuery({
    queryKey: queryKeys.contacts(),
    queryFn: () => http<Contact[]>("/contacts"),
  })
}

export function useOrganizations() {
  return useQuery({
    queryKey: queryKeys.organizations(),
    queryFn: () => http<Organization[]>("/organizations"),
  })
}

