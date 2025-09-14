"use client"

import EntityNavBar from "@/components/EntityNavBar"
import EntityTable, { EntityColumn } from "@/components/EntityTable"
import { useContacts, useOrganizations, Contact } from "@/state/queries/contacts"
import { useUsers } from "@/state/queries/leads"
import { useMemo } from "react"
import { useContactsUiStore } from "@/state/stores/contactsUiStore"

type ContactRow = {
  id: number
  firstname: string
  lastname: string
  title?: string
  email: string
  phone?: string
  account?: string
  assignedTo?: string
}

const ContactsPage = () => {
  const { data: contacts, isLoading: contactsLoading, error: contactsError } = useContacts()
  const { data: orgs, isLoading: orgsLoading, error: orgsError } = useOrganizations()
  const { data: users, isLoading: usersLoading, error: usersError } = useUsers()

  const headerLayout = useContactsUiStore((s) => s.headerLayout)
  const visibleColumns = useContactsUiStore((s) => s.visibleColumns)
  const setVisibleColumns = useContactsUiStore((s) => s.setVisibleColumns)

  const orgMap = useMemo(() => {
    const map = new Map<number, string>()
    ;(orgs ?? []).forEach((o) => map.set(o.id, o.accountname))
    return map
  }, [orgs])

  const userMap = useMemo(() => {
    const map = new Map<number, string>()
    ;(users ?? []).forEach((u) => map.set(u.id, `${u.first_name} ${u.last_name}`))
    return map
  }, [users])

  const rows: ContactRow[] = useMemo(() => {
    return (contacts ?? []).map((c: Contact) => ({
      id: c.id,
      firstname: c.firstname,
      lastname: c.lastname,
      title: c.title,
      email: c.email,
      phone: c.phone,
      account: c.account_id ? orgMap.get(c.account_id) : undefined,
      assignedTo: c.assigned_user_id ? userMap.get(c.assigned_user_id) : undefined,
    }))
  }, [contacts, orgMap, userMap])

  const columns: EntityColumn<ContactRow>[] = [
    { id: "firstname", header: "First Name", accessor: (r) => r.firstname, sortAccessor: (r) => r.firstname, filter: { type: "text", placeholder: "First name" }, width: 180 },
    { id: "lastname", header: "Last Name", accessor: (r) => r.lastname, sortAccessor: (r) => r.lastname, filter: { type: "text", placeholder: "Last name" }, width: 180 },
    { id: "title", header: "Title", accessor: (r) => r.title ?? "", sortAccessor: (r) => r.title ?? "", filter: { type: "text", placeholder: "Title" }, width: 240 },
    { id: "email", header: "Email", accessor: (r) => (<a className="hover:underline" href={`mailto:${r.email}`}>{r.email}</a>), sortAccessor: (r) => r.email, filter: { type: "text", placeholder: "Email" }, width: 260 },
    { id: "phone", header: "Phone", accessor: (r) => r.phone ?? "", sortAccessor: (r) => r.phone ?? "", filter: { type: "text", placeholder: "Phone" }, width: 180 },
    { id: "account", header: "Account", accessor: (r) => r.account ?? "", sortAccessor: (r) => r.account ?? "", filter: { type: "text", placeholder: "Account" }, width: 240 },
    { id: "assignedTo", header: "Assigned To", accessor: (r) => r.assignedTo ?? "", sortAccessor: (r) => r.assignedTo ?? "", filter: { type: "text", placeholder: "Owner" }, width: 220 },
  ]

  if (contactsLoading || usersLoading || orgsLoading) {
    return (
      <div className="flex flex-col gap-3">
        <EntityNavBar />
        <div className="p-4 text-sm text-muted-foreground">Loading contacts…</div>
      </div>
    )
  }

  if (contactsError || usersError || orgsError) {
    return (
      <div className="flex flex-col gap-3">
        <EntityNavBar />
        <div className="p-4 text-sm text-red-600">{(contactsError || usersError || orgsError)?.toString()}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <EntityNavBar />
      <EntityTable
        title="Contacts"
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        headerLayout={headerLayout}
        initialState={{ visibleColumns: visibleColumns ?? undefined }}
        onVisibleColumnsChange={(ids) => setVisibleColumns(ids)}
      />
    </div>
  )
}

export default ContactsPage

