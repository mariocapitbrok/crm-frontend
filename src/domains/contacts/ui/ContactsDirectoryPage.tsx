"use client"

import { useMemo, type ReactNode } from "react"
import EntityMenu, { buildDefaultMenus } from "@/components/entity-menu"
import EntityNavBar from "@/components/EntityNavBar"
import EntityTable, { type EntityColumn } from "@/components/EntityTable"
import type { EntityUiState } from "@/state/stores/createEntityUiStore"
import { FileSpreadsheet } from "lucide-react"
import { useContactDirectory, type ContactRecord } from "../application/queries"
import { useOrganizationDirectory } from "@/domains/organizations/application/queries"
import { useIdentityUsers } from "@/domains/identity/application/users"
import { useContactsUiStore } from "./store"

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

const contactIcon = <FileSpreadsheet className="size-7" />
const contactMenus = buildDefaultMenus(useContactsUiStore)

const contactEntity = {
  key: "contacts" as const,
  title: "Contacts",
  icon: contactIcon,
  menus: contactMenus,
  uiStore: useContactsUiStore,
}

export default function ContactsDirectoryPage() {
  const { data: contacts, isLoading: contactsLoading, error: contactsError } =
    useContactDirectory()
  const { data: orgs, isLoading: orgsLoading, error: orgsError } =
    useOrganizationDirectory()
  const { data: users, isLoading: usersLoading, error: usersError } =
    useIdentityUsers()

  const headerLayout = contactEntity.uiStore((s: EntityUiState) => s.headerLayout)
  const visibleColumns = contactEntity.uiStore(
    (s: EntityUiState) => s.visibleColumns,
  )
  const setVisibleColumns = contactEntity.uiStore(
    (s: EntityUiState) => s.setVisibleColumns,
  )
  const columnOrder = contactEntity.uiStore((s: EntityUiState) => s.columnOrder)
  const setColumnOrder = contactEntity.uiStore(
    (s: EntityUiState) => s.setColumnOrder,
  )

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
    return (contacts ?? []).map((contact: ContactRecord) => ({
      id: contact.id,
      firstname: contact.firstname,
      lastname: contact.lastname,
      title: contact.title,
      email: contact.email,
      phone: contact.phone,
      account: contact.account_id ? orgMap.get(contact.account_id) : undefined,
      assignedTo: contact.assigned_user_id
        ? userMap.get(contact.assigned_user_id)
        : undefined,
    }))
  }, [contacts, orgMap, userMap])

  const columns: EntityColumn<ContactRow>[] = [
    {
      id: "firstname",
      header: "First Name",
      accessor: (r) => r.firstname,
      sortAccessor: (r) => r.firstname,
      filter: { type: "text", placeholder: "First name" },
      width: 180,
    },
    {
      id: "lastname",
      header: "Last Name",
      accessor: (r) => r.lastname,
      sortAccessor: (r) => r.lastname,
      filter: { type: "text", placeholder: "Last name" },
      width: 180,
    },
    {
      id: "title",
      header: "Title",
      accessor: (r) => r.title ?? "",
      sortAccessor: (r) => r.title ?? "",
      filter: { type: "text", placeholder: "Title" },
      width: 240,
    },
    {
      id: "email",
      header: "Email",
      accessor: (r) => (
        <a className="hover:underline" href={`mailto:${r.email}`}>
          {r.email}
        </a>
      ),
      sortAccessor: (r) => r.email,
      filter: { type: "text", placeholder: "Email" },
      width: 260,
    },
    {
      id: "phone",
      header: "Phone",
      accessor: (r) => r.phone ?? "",
      sortAccessor: (r) => r.phone ?? "",
      filter: { type: "text", placeholder: "Phone" },
      width: 180,
    },
    {
      id: "account",
      header: "Account",
      accessor: (r) => r.account ?? "",
      sortAccessor: (r) => r.account ?? "",
      filter: { type: "text", placeholder: "Account" },
      width: 240,
    },
    {
      id: "assignedTo",
      header: "Assigned To",
      accessor: (r) => r.assignedTo ?? "",
      sortAccessor: (r) => r.assignedTo ?? "",
      filter: { type: "text", placeholder: "Owner" },
      width: 220,
    },
  ]

  if (contactsLoading || usersLoading || orgsLoading) {
    return (
      <EntityShell>
        <div className="p-4 text-sm text-muted-foreground">Loading contacts…</div>
      </EntityShell>
    )
  }

  if (contactsError || usersError || orgsError) {
    return (
      <EntityShell>
        <div className="p-4 text-sm text-red-600">
          {(contactsError || usersError || orgsError)?.toString()}
        </div>
      </EntityShell>
    )
  }

  return (
    <EntityShell
      menu={<EntityMenu uiStore={contactEntity.uiStore} menus={contactEntity.menus} />}
    >
      <EntityTable
        title="Contacts"
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        headerLayout={headerLayout}
        initialState={{
          visibleColumns: visibleColumns ?? undefined,
          columnOrder: columnOrder ?? undefined,
        }}
        onVisibleColumnsChange={setVisibleColumns}
        onColumnOrderChange={setColumnOrder}
      />
    </EntityShell>
  )
}

function EntityShell({
  children,
  menu,
}: {
  children: ReactNode
  menu?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <EntityNavBar
        title={contactEntity.title}
        icon={contactEntity.icon}
        menu={menu ?? <EntityMenu uiStore={contactEntity.uiStore} menus={contactEntity.menus} />}
        entitySingular="Contact"
        entityPlural={contactEntity.title}
      />
      {children}
    </div>
  )
}
