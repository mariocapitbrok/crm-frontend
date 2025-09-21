"use client"

import { useMemo, type FC } from "react"
import {
  EntityDirectory,
  buildDefaultMenus,
  type EntityColumn,
  type MenuRenderCtx,
} from "@/domains/entities/ui"
import { FileSpreadsheet, Settings2 } from "lucide-react"
import {
  useLeadDirectory,
  useLeadOwners,
  type LeadRecord,
} from "../application/queries"
import { useLeadsUiStore } from "./store"
import CreateLeadButton from "./CreateLeadButton"
import ImportRecords from "@/domains/entities/ui/EntityDirectory/ImportRecords"
import ConfigureLeadFieldsDialog from "./ConfigureLeadFieldsDialog"
import { MenubarItem, MenubarLabel } from "@/components/ui/menubar"

type LeadRow = {
  id: number
  firstname: string
  lastname: string
  company: string
  email: string
  assignedTo?: string
  website?: string | null
}

const leadIcon = <FileSpreadsheet className="size-7" />
const leadMenus = buildLeadMenus()

function buildLeadMenus() {
  const baseMenus = buildDefaultMenus(useLeadsUiStore)
  return baseMenus.map((menu) => {
    if (menu.id !== "edit") return menu

    const EditMenuContent: FC<MenuRenderCtx> = () => (
      <div className="w-56 p-1">
        <MenubarLabel>Edit</MenubarLabel>
        <ConfigureLeadFieldsDialog
          trigger={
            <MenubarItem
              className="flex items-center gap-2"
              onSelect={(event) => event.preventDefault()}
            >
              <Settings2 className="size-4" aria-hidden />
              Configure entity fields…
            </MenubarItem>
          }
        />
      </div>
    )

    return {
      ...menu,
      content: EditMenuContent,
    }
  })
}

const leadEntity = {
  key: "leads" as const,
  title: "Leads",
  singular: "Lead",
  icon: leadIcon,
  menus: leadMenus,
  uiStore: useLeadsUiStore,
}

export default function LeadsDirectoryPage() {
  const { data: leads, isLoading: leadsLoading, error: leadsError } = useLeadDirectory()
  const { data: users, isLoading: usersLoading, error: usersError } = useLeadOwners()

  const userMap = useMemo(() => {
    const map = new Map<number, string>()
    ;(users ?? []).forEach((u) =>
      map.set(u.id, `${u.first_name} ${u.last_name}`),
    )
    return map
  }, [users])

  const rows: LeadRow[] = useMemo(() => {
    return (leads ?? []).map((lead: LeadRecord) => ({
      id: lead.id,
      firstname: lead.firstname,
      lastname: lead.lastname,
      company: lead.company,
      email: lead.email,
      assignedTo: lead.assigned_user_id
        ? userMap.get(lead.assigned_user_id)
        : undefined,
      website: null,
    }))
  }, [leads, userMap])

  const columns: EntityColumn<LeadRow>[] = useMemo(
    () => [
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
        id: "company",
        header: "Company",
        accessor: (r) => r.company,
        sortAccessor: (r) => r.company,
        filter: { type: "text", placeholder: "Company" },
        width: 280,
      },
      {
        id: "website",
        header: "Website",
        accessor: (r) =>
          r.website ? (
            <a
              className="text-blue-600 hover:underline"
              href={r.website}
              target="_blank"
              rel="noreferrer"
            >
              {r.website}
            </a>
          ) : (
            ""
          ),
        sortAccessor: (r) => r.website ?? "",
        filter: { type: "text", placeholder: "Website" },
        width: 260,
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
        id: "assignedTo",
        header: "Assigned To",
        accessor: (r) => r.assignedTo ?? "",
        sortAccessor: (r) => r.assignedTo ?? "",
        filter: { type: "text", placeholder: "Owner" },
        width: 220,
      },
    ],
    [],
  )

  return (
    <EntityDirectory
      entity={leadEntity}
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      isLoading={leadsLoading || usersLoading}
      loadingMessage="Loading leads…"
      error={leadsError || usersError}
      navActions={
        <>
          <CreateLeadButton owners={users} ownersLoading={usersLoading} />
          <ImportRecords
            entity={leadEntity.title}
            buttonText="Import"
            buttonProps={{ className: "text-[13px]" }}
          />
        </>
      }
    />
  )
}
