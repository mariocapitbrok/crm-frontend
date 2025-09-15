import type { NormalizedDef } from "./types"

export function normalizeDef(input: Partial<NormalizedDef>, allColumnIds: string[]): NormalizedDef {
  return {
    q: input.q ?? "",
    filters: input.filters ?? {},
    sort: input.sort ?? null,
    visibleColumns: input.visibleColumns ?? allColumnIds,
    columnOrder: input.columnOrder ?? allColumnIds,
  }
}

export function shallowEqualObj(a: Record<string, string>, b: Record<string, string>) {
  const ak = Object.keys(a)
  const bk = Object.keys(b)
  if (ak.length !== bk.length) return false
  for (const k of ak) if (a[k] !== b[k]) return false
  return true
}

export function isSameDef(a: NormalizedDef, b: NormalizedDef) {
  if ((a.q ?? "") !== (b.q ?? "")) return false
  if (!!a.sort !== !!b.sort) return false
  if (a.sort && b.sort) {
    if (a.sort.columnId !== b.sort.columnId || a.sort.dir !== b.sort.dir) return false
  }
  const arrEq = (x: string[], y: string[]) => x.length === y.length && x.every((v, i) => v === y[i])
  if (!arrEq(a.visibleColumns, b.visibleColumns)) return false
  if (!arrEq(a.columnOrder, b.columnOrder)) return false
  if (!shallowEqualObj(a.filters, b.filters)) return false
  return true
}

