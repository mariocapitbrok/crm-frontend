"use client"

import * as React from "react"

export function useTablePagination<T>(params: {
  data: T[]
  pageSize?: number
  initialPage?: number
}) {
  const { data, pageSize = 20, initialPage = 0 } = params
  const [page, setPage] = React.useState<number>(initialPage)
  const [pageJump, setPageJump] = React.useState<string>(String(initialPage + 1))

  const total = data.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const pageStart = page * pageSize
  const pageEnd = Math.min(total, pageStart + pageSize)
  const pageRows = React.useMemo(() => data.slice(pageStart, pageEnd), [data, pageStart, pageEnd])

  React.useEffect(() => {
    setPageJump(String(page + 1))
  }, [page])

  const goToPage = React.useCallback(() => {
    const n = parseInt(pageJump, 10)
    if (Number.isNaN(n)) return
    const clamped = Math.max(1, Math.min(pages, n))
    setPage(clamped - 1)
  }, [pageJump, pages])

  return {
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
  }
}

