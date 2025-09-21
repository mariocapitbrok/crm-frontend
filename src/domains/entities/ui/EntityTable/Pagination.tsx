"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Pagination(props: {
  page: number
  pages: number
  pageJump: string
  setPageJump: (v: string) => void
  onGoTo: () => void
  onPrev: () => void
  onNext: () => void
  summary?: string
  className?: string
}) {
  const { page, pages, pageJump, setPageJump, onGoTo, onPrev, onNext, summary, className } = props
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div>{summary}</div>
      <div className="inline-flex items-center gap-2">
        <span>
          Page {page + 1} / {pages}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[13px]">Go to</span>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={pages}
            value={pageJump}
            onChange={(e) => setPageJump(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onGoTo()
            }}
            aria-label="Go to page"
            className="h-8 w-[72px] px-2 text-[13px]"
          />
          <Button
            variant="outline"
            size="sm"
            className="text-[13px]"
            onClick={onGoTo}
          >
            Go
          </Button>
        </div>
        <Button disabled={page === 0} variant="outline" size="sm" onClick={onPrev}>
          Prev
        </Button>
        <Button
          disabled={page >= pages - 1}
          variant="outline"
          size="sm"
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
