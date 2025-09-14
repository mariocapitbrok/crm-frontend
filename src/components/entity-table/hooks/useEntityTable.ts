"use client"

import type {
  EntityColumn,
  GetRowId,
  HeaderLayout,
  ID,
  SortState,
} from "../types"
import { useTablePagination } from "./useTablePagination"
import { useTableQuery } from "./useTableQuery"
import { useTableSelection } from "./useTableSelection"
import { useTableSort } from "./useTableSort"

export function useEntityTable<T>(params: {
  data: T[]
  columns: EntityColumn<T>[]
  getRowId: GetRowId<T>
  pageSize?: number
  headerLayout?: HeaderLayout
  initialState?: {
    q?: string
    filters?: Record<string, string>
    sort?: SortState
    page?: number
    selected?: Set<ID>
  }
  onSelectionChange?: (ids: Set<ID>) => void
}) {
  const { data, columns, getRowId, pageSize, initialState, onSelectionChange } =
    params

  const { q, setQ, filters, setFilters, filtered } = useTableQuery<T>({
    data,
    columns,
    initialQ: initialState?.q,
    initialFilters: initialState?.filters,
  })

  const { sort, setSort, toggleSort, sorted } = useTableSort<T>({
    data: filtered,
    columns,
    initialSort: initialState?.sort,
  })

  const {
    page,
    setPage,
    pageJump,
    setPageJump,
    goToPage,
    pages,
    total,
    pageStart,
    pageEnd,
    pageRows,
  } = useTablePagination<T>({
    data: sorted,
    pageSize,
    initialPage: initialState?.page,
  })

  const selection = useTableSelection<T>({
    pageRows,
    allRows: sorted,
    getRowId,
    initialSelected: initialState?.selected,
    onChange: onSelectionChange,
  })

  return {
    q,
    setQ,
    filters,
    setFilters,
    sort,
    setSort,
    toggleSort,
    page,
    setPage,
    pageJump,
    setPageJump,
    goToPage,
    pages,
    total,
    pageStart,
    pageEnd,
    pageRows,
    selection,
  }
}
