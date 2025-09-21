"use client"

import { useState, useMemo, type ReactNode } from "react"
import EntityMenu from "@/components/entity-menu"
import EntityNavBar from "@/components/EntityNavBar"
import EntityTable, { type EntityColumn } from "@/components/EntityTable"
import SavedViewPicker from "@/components/SavedViewPicker"
import { buildDefaultMenus } from "@/components/entity-menu"
import type { EntityUiState } from "@/state/stores/createEntityUiStore"
import type { ViewDefinition } from "@/febe/types"
import { FileSpreadsheet } from "lucide-react"
import { useLeadDirectory, useLeadOwners, type LeadRecord } from "../application/queries"
import { useLeadsUiStore } from "./store"

type LeadRow = {
  id: number
  firstname: string
  lastname: string
  company: string
  email: string
  assignedTo?: string
  website?: string | null
}

type SortType = {
  columnId: string
  dir: "asc" | "desc"
}

type WorkingViewDefinition = {
  q: string
  filters: Record<string, string>
  sort: SortType | null
  visibleColumns: string[]
  columnOrder: string[]
  headerLayout: "split" | "popover"
}

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((item, index) => item === b[index])

const normalizeDiff = (ids: string[] | null, baseline: string[]) => {
  if (!ids) return null
  return arraysEqual(ids, baseline) ? null : ids
}

const leadIcon = <FileSpreadsheet className="size-7" />
const leadMenus = buildDefaultMenus(useLeadsUiStore)

const leadEntity = {
  key: "leads" as const,
  title: "Leads",
  icon: leadIcon,
  menus: leadMenus,
  uiStore: useLeadsUiStore,
}

export default function LeadDirectoryPage() {
  const { data: leads, isLoading: leadsLoading, error: leadsError } = useLeadDirectory()
  const { data: users, isLoading: usersLoading, error: usersError } = useLeadOwners()
  // UI state from domain-specific store
  const headerLayout = leadEntity.uiStore((s: EntityUiState) => s.headerLayout)
  const setHeaderLayout = leadEntity.uiStore(
    (s: EntityUiState) => s.setHeaderLayout,
  )
  const visibleColumns = leadEntity.uiStore(
    (s: EntityUiState) => s.visibleColumns,
  )
  const setVisibleColumns = leadEntity.uiStore(
    (s: EntityUiState) => s.setVisibleColumns,
  )
  const columnOrder = leadEntity.uiStore((s: EntityUiState) => s.columnOrder)
  const setColumnOrder = leadEntity.uiStore(
    (s: EntityUiState) => s.setColumnOrder,
  )

  // Saved Views integration state
  const [activeViewId, setActiveViewId] = useState<number | null>(null)
  const [activeViewDef, setActiveViewDef] = useState<ViewDefinition | null>(
    null,
  )
  const [q, setQ] = useState<string>("")
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<SortType | null>(null)
  const [tableRev, setTableRev] = useState(0)
  const [tempVisibleColumns, setTempVisibleColumns] = useState<string[] | null>(
    null,
  )
  const [tempColumnOrder, setTempColumnOrder] = useState<string[] | null>(null)
  const [defaultWorkingDef, setDefaultWorkingDef] =
    useState<WorkingViewDefinition | null>(null)

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

  const allColumnIds = useMemo(() => columns.map((c) => c.id), [columns])

  if (leadsLoading || usersLoading) {
    return (
      <EntityShell>
        <div className="p-4 text-sm text-muted-foreground">Loading leads…</div>
      </EntityShell>
    )
  }

  if (leadsError || usersError) {
    return (
      <EntityShell>
        <div className="p-4 text-sm text-red-600">
          {(leadsError || usersError)?.toString()}
        </div>
      </EntityShell>
    )
  }

  const isDirty = Boolean(
    activeViewId === null &&
      (q !== "" ||
        Object.keys(filters).length > 0 ||
        sort !== null ||
        tempVisibleColumns !== null ||
        tempColumnOrder !== null),
  )

  return (
    <EntityShell
      menu={<EntityMenu uiStore={leadEntity.uiStore} menus={leadEntity.menus} />}
    >
      <EntityTable
        key={`leads-${tableRev}`}
        title="Leads"
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        headerLayout={headerLayout}
        initialState={
          activeViewId
            ? {
                q: activeViewDef?.q,
                filters: activeViewDef?.filters,
                sort: activeViewDef?.sort as SortType,
                visibleColumns: activeViewDef?.visibleColumns,
                columnOrder: activeViewDef?.columnOrder,
              }
            : {
                q,
                filters,
                sort,
                visibleColumns: tempVisibleColumns ?? allColumnIds,
                columnOrder: tempColumnOrder ?? allColumnIds,
              }
        }
        onQChange={setQ}
        onFiltersChange={setFilters}
        onSortChange={setSort}
        onVisibleColumnsChange={(ids) => {
          if (activeViewId === null) {
            setTempVisibleColumns(normalizeDiff(ids, allColumnIds))
          } else {
            setTempVisibleColumns(ids)
            setVisibleColumns(ids)
          }
        }}
        onColumnOrderChange={(ids) => {
          if (activeViewId === null) {
            setTempColumnOrder(normalizeDiff(ids, allColumnIds))
          } else {
            setTempColumnOrder(ids)
            setColumnOrder(ids)
          }
        }}
        headerLeftExtras={
          <SavedViewPicker
            entity={leadEntity.key}
            activeViewId={activeViewId}
            onSelectView={(view) => {
              if (view) {
                if (activeViewId === null) {
                  const all = allColumnIds
                  setDefaultWorkingDef({
                    q,
                    filters,
                    sort,
                    visibleColumns: tempVisibleColumns ?? visibleColumns ?? all,
                    columnOrder: tempColumnOrder ?? columnOrder ?? all,
                    headerLayout,
                  })
                }
                setActiveViewId(view.id)
                setActiveViewDef(view.definition)
                if (view.definition.headerLayout) {
                  setHeaderLayout(view.definition.headerLayout)
                }
                setQ(view.definition.q ?? "")
                setFilters(view.definition.filters ?? {})
                setSort(view.definition.sort ?? null)
                if (view.definition.visibleColumns)
                  setVisibleColumns(view.definition.visibleColumns)
                if (view.definition.columnOrder)
                  setColumnOrder(view.definition.columnOrder)
                setTableRev((n) => n + 1)
              } else {
                setActiveViewId(null)
                setActiveViewDef(null)
                if (defaultWorkingDef) {
                  setQ(defaultWorkingDef.q)
                  setFilters(defaultWorkingDef.filters)
                  setSort(defaultWorkingDef.sort)
                  setTempVisibleColumns(
                    normalizeDiff(
                      defaultWorkingDef.visibleColumns,
                      allColumnIds,
                    ),
                  )
                  setTempColumnOrder(
                    normalizeDiff(defaultWorkingDef.columnOrder, allColumnIds),
                  )
                }
                setVisibleColumns(null)
                setColumnOrder(null)
                setTableRev((n) => n + 1)
              }
            }}
            getCurrentDefinition={() => ({
              q,
              filters,
              sort,
              visibleColumns:
                tempVisibleColumns ?? visibleColumns ?? allColumnIds,
              columnOrder: tempColumnOrder ?? columnOrder ?? allColumnIds,
              headerLayout,
            })}
            onResetToDefault={() => {
              setActiveViewId(null)
              setActiveViewDef(null)
              setQ("")
              setFilters({})
              setSort(null)
              setTempVisibleColumns(null)
              setTempColumnOrder(null)
              setVisibleColumns(null)
              setColumnOrder(null)
              setTableRev((n) => n + 1)
            }}
            isDirty={isDirty}
          />
        }
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
        title={leadEntity.title}
        icon={leadEntity.icon}
        menu={menu ?? <EntityMenu uiStore={leadEntity.uiStore} menus={leadEntity.menus} />}
        entitySingular="Lead"
        entityPlural={leadEntity.title}
      />
      {children}
    </div>
  )
}
