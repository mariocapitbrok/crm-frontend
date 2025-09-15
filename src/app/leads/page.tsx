"use client"

import EntityMenu from "@/components/entity-menu"
import EntityNavBar from "@/components/EntityNavBar"
import EntityTable, { EntityColumn } from "@/components/EntityTable"
import { getEntityConfig } from "@/entities/registry"
import { Lead, useLeads, useUsers } from "@/state/queries/leads"
import { EntityUiState } from "@/state/stores/createEntityUiStore"
import { useMemo } from "react"
import * as React from "react"
import SavedViewPicker from "@/components/SavedViewPicker"

type LeadRow = {
  id: number
  firstname: string
  lastname: string
  company: string
  email: string
  assignedTo?: string
  website?: string | null
}

const Leads = () => {
  const { data: leads, isLoading: leadsLoading, error: leadsError } = useLeads()
  const { data: users, isLoading: usersLoading, error: usersError } = useUsers()
  const cfg = getEntityConfig("leads")
  const headerLayout = cfg.uiStore((s: EntityUiState) => s.headerLayout)
  const setHeaderLayout = cfg.uiStore((s: EntityUiState) => s.setHeaderLayout)
  const visibleColumns = cfg.uiStore((s: EntityUiState) => s.visibleColumns)
  const setVisibleColumns = cfg.uiStore((s: EntityUiState) => s.setVisibleColumns)
  const columnOrder = cfg.uiStore((s: EntityUiState) => s.columnOrder)
  const setColumnOrder = cfg.uiStore((s: EntityUiState) => s.setColumnOrder)

  // Saved Views integration state
  const [activeViewId, setActiveViewId] = React.useState<number | null>(null)
  const [activeViewDef, setActiveViewDef] = React.useState<{
    q?: string
    filters?: Record<string, string>
    sort?: { columnId: string; dir: "asc" | "desc" } | null
    visibleColumns?: string[]
    columnOrder?: string[]
    headerLayout?: "split" | "popover"
  } | null>(null)
  const [q, setQ] = React.useState<string>("")
  const [filters, setFilters] = React.useState<Record<string, string>>({})
  const [sort, setSort] = React.useState<{ columnId: string; dir: "asc" | "desc" } | null>(null)
  const [tableRev, setTableRev] = React.useState(0)
  const [tempVisibleColumns, setTempVisibleColumns] = React.useState<string[] | null>(null)
  const [tempColumnOrder, setTempColumnOrder] = React.useState<string[] | null>(null)
  const [defaultWorkingDef, setDefaultWorkingDef] = React.useState<{
    q: string
    filters: Record<string, string>
    sort: { columnId: string; dir: "asc" | "desc" } | null
    visibleColumns: string[]
    columnOrder: string[]
  } | null>(null)

  const userMap = useMemo(() => {
    const map = new Map<number, string>()
    ;(users ?? []).forEach((u) =>
      map.set(u.id, `${u.first_name} ${u.last_name}`)
    )
    return map
  }, [users])

  const rows: LeadRow[] = useMemo(() => {
    return (leads ?? []).map((l: Lead) => ({
      id: l.id,
      firstname: l.firstname,
      lastname: l.lastname,
      company: l.company,
      email: l.email,
      assignedTo: l.assigned_user_id
        ? userMap.get(l.assigned_user_id)
        : undefined,
      website: null,
    }))
  }, [leads, userMap])

  const columns: EntityColumn<LeadRow>[] = [
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
          <span className="text-muted-foreground">—</span>
        ),
      sortAccessor: (r) => r.website ?? "",
      filter: { type: "text", placeholder: "Website" },
      width: 260,
    },
    {
      id: "email",
      header: "Primary Email",
      accessor: (r) => (
        <a className="hover:underline" href={`mailto:${r.email}`}>
          {r.email}
        </a>
      ),
      sortAccessor: (r) => r.email,
      filter: { type: "text", placeholder: "Email" },
      width: 280,
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

  const allColumnIds = React.useMemo(() => columns.map((c) => c.id), [columns])

  function normalizeDef(def: {
    q?: string
    filters?: Record<string, string>
    sort?: { columnId: string; dir: "asc" | "desc" } | null
    visibleColumns?: string[]
    columnOrder?: string[]
  }) {
    return {
      q: def.q ?? "",
      filters: def.filters ?? {},
      sort: def.sort ?? null,
      visibleColumns: def.visibleColumns ?? allColumnIds,
      columnOrder: def.columnOrder ?? allColumnIds,
    }
  }

  function shallowEqualObj(a: Record<string, string>, b: Record<string, string>) {
    const ak = Object.keys(a)
    const bk = Object.keys(b)
    if (ak.length !== bk.length) return false
    for (const k of ak) if (a[k] !== b[k]) return false
    return true
  }

  function isSameDef(a: ReturnType<typeof normalizeDef>, b: ReturnType<typeof normalizeDef>) {
    if ((a.q ?? "") !== (b.q ?? "")) return false
    if (!!a.sort !== !!b.sort) return false
    if (a.sort && b.sort) {
      if (a.sort.columnId !== b.sort.columnId || a.sort.dir !== b.sort.dir) return false
    }
    const arrEq = (x?: string[], y?: string[]) =>
      (x ?? []).length === (y ?? []).length && (x ?? []).every((v, i) => v === (y ?? [])[i])
    if (!arrEq(a.visibleColumns, b.visibleColumns)) return false
    if (!arrEq(a.columnOrder, b.columnOrder)) return false
    if (!shallowEqualObj(a.filters, b.filters)) return false
    return true
  }

  const currentDefNorm = normalizeDef({
    q,
    filters,
    sort,
    visibleColumns: (tempVisibleColumns ?? visibleColumns) ?? undefined,
    columnOrder: (tempColumnOrder ?? columnOrder) ?? undefined,
  })
  const baselineDefNorm = normalizeDef(
    activeViewDef ?? { q: "", filters: {}, sort: null, visibleColumns: allColumnIds, columnOrder: allColumnIds }
  )
  const isDirty = !isSameDef(currentDefNorm, baselineDefNorm)

  if (leadsLoading || usersLoading) {
    return (
      <div className="flex flex-col gap-3">
        <EntityNavBar
          title={cfg.title}
          icon={cfg.icon}
          menu={<EntityMenu uiStore={cfg.uiStore} menus={cfg.menus} />}
          entitySingular="Lead"
          entityPlural={cfg.title}
        />
        <div className="p-4 text-sm text-muted-foreground">Loading leads…</div>
      </div>
    )
  }

  if (leadsError || usersError) {
    return (
      <div className="flex flex-col gap-3">
        <EntityNavBar
          title={cfg.title}
          icon={cfg.icon}
          menu={<EntityMenu uiStore={cfg.uiStore} menus={cfg.menus} />}
          entitySingular="Lead"
          entityPlural={cfg.title}
        />
        <div className="p-4 text-sm text-red-600">
          {(leadsError || usersError)?.toString()}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <EntityNavBar
        title={cfg.title}
        icon={cfg.icon}
        menu={<EntityMenu uiStore={cfg.uiStore} menus={cfg.menus} />}
        entitySingular="Lead"
        entityPlural={cfg.title}
      />
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
                sort: activeViewDef?.sort as any,
                visibleColumns: activeViewDef?.visibleColumns,
                columnOrder: activeViewDef?.columnOrder,
              }
            : {
                q,
                filters,
                sort: sort as any,
                visibleColumns: (tempVisibleColumns ?? allColumnIds),
                columnOrder: (tempColumnOrder ?? allColumnIds),
              }
        }
        onQChange={setQ}
        onFiltersChange={setFilters}
        onSortChange={setSort}
        onVisibleColumnsChange={(ids) => {
          setTempVisibleColumns(ids)
          if (activeViewId !== null) setVisibleColumns(ids)
        }}
        onColumnOrderChange={(ids) => {
          setTempColumnOrder(ids)
          if (activeViewId !== null) setColumnOrder(ids)
        }}
        headerLeftExtras={
          <SavedViewPicker
            entity={cfg.key}
            activeViewId={activeViewId}
            onSelectView={(view) => {
              if (view) {
                // Moving from Default → Saved View: snapshot Default working state once
                if (activeViewId === null) {
                  const all = allColumnIds
                  setDefaultWorkingDef({
                    q,
                    filters,
                    sort,
                    visibleColumns: (tempVisibleColumns ?? visibleColumns ?? all)!,
                    columnOrder: (tempColumnOrder ?? columnOrder ?? all)!,
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
                if (view.definition.visibleColumns) setVisibleColumns(view.definition.visibleColumns)
                if (view.definition.columnOrder) setColumnOrder(view.definition.columnOrder)
                // Force remount to apply selected view's initial state
                setTableRev((n) => n + 1)
              } else {
                // Switching back to Default View: restore previous working state if available
                setActiveViewId(null)
                setActiveViewDef(null)
                if (defaultWorkingDef) {
                  setQ(defaultWorkingDef.q)
                  setFilters(defaultWorkingDef.filters)
                  setSort(defaultWorkingDef.sort)
                  setTempVisibleColumns(defaultWorkingDef.visibleColumns)
                  setTempColumnOrder(defaultWorkingDef.columnOrder)
                }
                // Clear persisted prefs for default
                setVisibleColumns(null)
                setColumnOrder(null)
                setTableRev((n) => n + 1)
              }
            }}
            getCurrentDefinition={() => ({
              q,
              filters,
              sort,
              visibleColumns: (tempVisibleColumns ?? visibleColumns) ?? allColumnIds,
              columnOrder: (tempColumnOrder ?? columnOrder) ?? allColumnIds,
              headerLayout,
            })}
            onResetToDefault={() => {
              const all = columns.map((c) => c.id)
              setActiveViewId(null)
              setActiveViewDef(null)
              setQ("")
              setFilters({})
              setSort(null)
              // Ephemeral state reflects default
              setTempVisibleColumns(all)
              setTempColumnOrder(all)
              // Do not persist custom default; clear persisted prefs
              setVisibleColumns(null)
              setColumnOrder(null)
              setTableRev((n) => n + 1)
            }}
            isDirty={isDirty}
          />
        }
      />
    </div>
  )
}

export default Leads
