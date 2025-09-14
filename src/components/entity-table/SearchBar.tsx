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
}) {
  const { q, onChange, title, summary, className } = props
  return (
    <div className={className} role="search">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Search ${title ?? "records"}...`}
              aria-label={`Search ${title ?? "records"}`}
              className="h-8 w-[420px] pl-8 pr-8 text-[13px]"
            />
            {q && (
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1.5 inline-flex size-5 items-center justify-center rounded hover:bg-muted"
              >
                <X className="size-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground" aria-live="polite">
          {summary}
        </div>
      </div>
    </div>
  )
}
