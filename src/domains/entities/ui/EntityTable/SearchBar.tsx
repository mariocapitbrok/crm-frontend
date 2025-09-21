"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

export function SearchBar(props: {
  q: string
  onChange: (value: string) => void
  title?: string
  summary?: string
  className?: string
  debounceMs?: number
  onClear?: () => void
  leftExtras?: React.ReactNode
  rightExtras?: React.ReactNode
}) {
  const { q, onChange, title, summary, className, debounceMs = 0, onClear, leftExtras, rightExtras } = props
  const [inner, setInner] = React.useState(q)
  const tRef = React.useRef<number | null>(null)

  // Keep local state in sync when parent value changes externally
  React.useEffect(() => {
    setInner(q)
  }, [q])

  React.useEffect(() => () => {
    if (tRef.current) window.clearTimeout(tRef.current)
  }, [])

  const emit = (value: string) => {
    if (tRef.current) window.clearTimeout(tRef.current)
    if (debounceMs > 0) {
      tRef.current = window.setTimeout(() => {
        onChange(value)
      }, debounceMs)
    } else {
      onChange(value)
    }
  }
  return (
    <div className={className} role="search">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={inner}
              onChange={(e) => {
                const v = e.target.value
                setInner(v)
                emit(v)
              }}
              placeholder={`Search ${title ?? "records"}...`}
              aria-label={`Search ${title ?? "records"}`}
              className="h-8 w-[420px] pl-8 pr-8 text-[13px]"
            />
            {inner && (
              <button
                type="button"
                onClick={() => {
                  if (tRef.current) window.clearTimeout(tRef.current)
                  setInner("")
                  onChange("")
                  onClear?.()
                }}
                aria-label="Clear search"
                className="absolute right-1.5 top-1.5 inline-flex size-5 items-center justify-center rounded hover:bg-muted"
              >
                <X className="size-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          {leftExtras}
        </div>
        <div className="flex items-center gap-2">
          {rightExtras}
          <div className="text-xs text-muted-foreground" aria-live="polite">
            {summary}
          </div>
        </div>
      </div>
    </div>
  )
}
