"use client"

import { useMemo, useState, type ReactNode } from "react"
import EntityNavBar from "./EntityNavBar"
import {
  EntityTable,
  type EntityColumn,
  type EntityTableProps,
} from "@/domains/entities/ui/EntityTable"
import EntityMenu, {
  type MenuSpec,
  type UiStoreHook,
} from "@/domains/entities/ui/EntityMenu"
import { SavedViewPicker } from "@/domains/entities/ui/EntityViews"
import type { EntityKey } from "@/domains/entityKeys"
import type { ViewDefinition, ViewSort } from "@/febe/types"
import type {
  EntityUiState,
  HeaderLayout,
} from "@/state/stores/createEntityUiStore"

type EntityDescriptor = {
  key: EntityKey
  title: string
  singular: string
  icon: ReactNode
  menus?: MenuSpec[]
  uiStore: UiStoreHook
}

type WorkingViewDefinition = {
  q: string
  filters: Record<string, string>
  sort: ViewSort
  visibleColumns: string[]
  columnOrder: string[]
  headerLayout: HeaderLayout
}

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((item, index) => item === b[index])

const normalizeDiff = (ids: string[] | null, baseline: string[]) => {
  if (!ids) return null
  return arraysEqual(ids, baseline) ? null : ids
}

type ControlledTableProps =
  | "data"
  | "columns"
  | "getRowId"
  | "headerLayout"
  | "initialState"
  | "onQChange"
  | "onFiltersChange"
  | "onSortChange"
  | "onVisibleColumnsChange"
  | "onColumnOrderChange"
  | "headerLeftExtras"

type TableExtras<Row> = Omit<EntityTableProps<Row>, ControlledTableProps>

export type EntityDirectoryProps<Row> = {
  entity: EntityDescriptor
  rows: Row[]
  columns: EntityColumn<Row>[]
  getRowId: (row: Row) => string | number
  isLoading: boolean
  loadingMessage: string
  error?: unknown
  tableProps?: TableExtras<Row>
}

export default function EntityDirectory<Row>({
  entity,
  rows,
  columns,
  getRowId,
  isLoading,
  loadingMessage,
  error,
  tableProps,
}: EntityDirectoryProps<Row>) {
  const headerLayout = entity.uiStore((s: EntityUiState) => s.headerLayout)
  const setHeaderLayout = entity.uiStore(
    (s: EntityUiState) => s.setHeaderLayout,
  )
  const visibleColumns = entity.uiStore(
    (s: EntityUiState) => s.visibleColumns,
  )
  const setVisibleColumns = entity.uiStore(
    (s: EntityUiState) => s.setVisibleColumns,
  )
  const columnOrder = entity.uiStore((s: EntityUiState) => s.columnOrder)
  const setColumnOrder = entity.uiStore(
    (s: EntityUiState) => s.setColumnOrder,
  )

  const [activeViewId, setActiveViewId] = useState<number | null>(null)
  const [activeViewDef, setActiveViewDef] = useState<ViewDefinition | null>(
    null,
  )
  const [q, setQ] = useState<string>("")
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<ViewSort>(null)
  const [tableRev, setTableRev] = useState(0)
  const [tempVisibleColumns, setTempVisibleColumns] = useState<string[] | null>(
    null,
  )
  const [tempColumnOrder, setTempColumnOrder] = useState<string[] | null>(null)
  const [defaultWorkingDef, setDefaultWorkingDef] =
    useState<WorkingViewDefinition | null>(null)

  const allColumnIds = useMemo(() => columns.map((c) => c.id), [columns])
  const errorMessage = error ? String(error) : null

  if (isLoading) {
    return (
      <EntityShell entity={entity}>
        <div className="p-4 text-sm text-muted-foreground">{loadingMessage}</div>
      </EntityShell>
    )
  }

  if (errorMessage) {
    return (
      <EntityShell entity={entity}>
        <div className="p-4 text-sm text-red-600">{errorMessage}</div>
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

  const mergedTableProps = {
    ...tableProps,
    title: tableProps?.title ?? entity.title,
  }

  const initialState = activeViewId
    ? {
        q: activeViewDef?.q,
        filters: activeViewDef?.filters,
        sort: (activeViewDef?.sort ?? null) as ViewSort,
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

  return (
    <EntityShell entity={entity}>
      <EntityTable
        key={`${entity.key}-${tableRev}`}
        data={rows}
        columns={columns}
        getRowId={getRowId}
        headerLayout={headerLayout}
        initialState={initialState}
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
            entity={entity.key}
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
        {...mergedTableProps}
      />
    </EntityShell>
  )
}

function EntityShell({
  entity,
  children,
  menu,
}: {
  entity: EntityDescriptor
  children: ReactNode
  menu?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <EntityNavBar
        title={entity.title}
        icon={entity.icon}
        menu={
          menu ?? (
            <EntityMenu uiStore={entity.uiStore} menus={entity.menus} />
          )
        }
        entitySingular={entity.singular}
        entityPlural={entity.title}
      />
      {children}
    </div>
  )
}
