"use client"

import { useMemo, type FC } from "react"
import {
  EntityDirectory,
  buildDefaultMenus,
  type EntityColumn,
  type MenuRenderCtx,
  useEntityFields,
  type EntityFieldDefinition,
} from "@/domains/entities/ui"
import { FileSpreadsheet, Settings2 } from "lucide-react"
import {
  useLeadDirectory,
  useLeadOwners,
  type LeadRecord,
} from "../application/queries"
import { coreLeadFieldDefinitions } from "../domain/leadSchemas"
import { useLeadsUiStore } from "./store"
import CreateLeadButton from "./CreateLeadButton"
import ImportRecords from "@/domains/entities/ui/EntityDirectory/ImportRecords"
import ConfigureLeadFieldsDialog from "./ConfigureLeadFieldsDialog"
import { MenubarItem, MenubarLabel } from "@/components/ui/menubar"

type LeadRow = {
  id: number
  [key: string]: unknown
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
  const { data: fieldDefinitions } = useEntityFields("leads")

  const definitions = useMemo< EntityFieldDefinition[]>(() => {
    if (!fieldDefinitions) {
      return coreLeadFieldDefinitions
    }
    return fieldDefinitions
  }, [fieldDefinitions])

  const userMap = useMemo(() => {
    const map = new Map<number, string>()
    ;(users ?? []).forEach((u) =>
      map.set(u.id, `${u.first_name} ${u.last_name}`),
    )
    return map
  }, [users])

  const rows: LeadRow[] = useMemo(() => {
    return (leads ?? []).map((lead: LeadRecord) => {
      const row: LeadRow = { id: lead.id }
      definitions.forEach((def) => {
        if (def.dataType === "user") {
          const ownerId = lead[def.id] as number | undefined
          row[def.id] = ownerId ? userMap.get(ownerId) ?? "" : ""
          return
        }
        const value = lead[def.id]
        row[def.id] = value ?? ""
      })
      return row
    })
  }, [definitions, leads, userMap])

  const columns: EntityColumn<LeadRow>[] = useMemo(() => {
    return definitions.map((definition) => {
      const basePlaceholder = definition.label
      const width = definition.dataType === "text" ? 200 : 220

      const column: EntityColumn<LeadRow> = {
        id: definition.id,
        header: definition.label,
        accessor: (row) => {
          const value = row[definition.id]
          if (definition.dataType === "email" && typeof value === "string" && value) {
            return (
              <a className="hover:underline" href={`mailto:${value}`}>
                {value}
              </a>
            )
          }
          return value ?? ""
        },
        sortAccessor: (row) => {
          const value = row[definition.id]
          if (typeof value === "number") return value
          return typeof value === "string" ? value : ""
        },
        filter: { type: "text", placeholder: basePlaceholder },
        width,
      }

      return column
    })
  }, [definitions])

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
