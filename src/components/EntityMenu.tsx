"use client"

import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CheckIcon } from "lucide-react"
import type { EntityUiState, HeaderLayout } from "@/state/stores/createEntityUiStore"
import * as React from "react"

type UiStoreHook = <T>(selector: (s: EntityUiState) => T) => T

export type MenuRenderCtx = { uiStore: UiStoreHook }

export type MenuSpec = {
  id: string
  label: string
  content?: React.ReactNode | ((ctx: MenuRenderCtx) => React.ReactNode)
}

export type EntityMenuProps = {
  uiStore: UiStoreHook
  menus?: MenuSpec[]
}

export function buildDefaultMenus(uiStore: UiStoreHook): MenuSpec[] {
  const labels = ["File", "Edit", "Insert", "Format", "Data", "View", "Tools", "Extensions", "Help"]
  const viewSpec: MenuSpec = {
    id: "view",
    label: "View",
    content: ({ uiStore }) => {
      const headerLayout = uiStore((s) => s.headerLayout)
      const setHeaderLayout = uiStore((s) => s.setHeaderLayout)
      const layoutOptions: { value: HeaderLayout; label: string }[] = [
        { value: "split", label: "Split filters" },
        { value: "popover", label: "Popover filters" },
      ]
      return (
        <div className="w-56 p-1">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Table header</div>
          <div className="py-1">
            {layoutOptions.map((opt) => {
              const selected = headerLayout === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHeaderLayout(opt.value as HeaderLayout)}
                  className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="inline-flex size-4 items-center justify-center">
                    {selected ? <CheckIcon className="size-4" /> : null}
                  </span>
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )
    },
  }

  const defaultContent = (label: string) => (
    <div className="w-56 p-2">
      <div className="px-1 pb-2 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="rounded-md border p-2 text-sm text-muted-foreground">Coming soon</div>
    </div>
  )

  return labels.map((label) => {
    const id = label.toLowerCase()
    if (id === "view") return viewSpec
    return { id, label, content: defaultContent(label) }
  })
}

const EntityMenu = ({ uiStore, menus }: EntityMenuProps) => {
  const items = menus ?? buildDefaultMenus(uiStore)
  const [openId, setOpenId] = React.useState<string | null>(null)

  return (
    <div className="flex flex-wrap items-center gap-1 pt-1">
      {items.map((m) => (
        <Popover
          key={m.id}
          open={openId === m.id}
          onOpenChange={(open) => setOpenId((prev) => (open ? m.id : prev === m.id ? null : prev))}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative z-[60] h-4 px-2 first:pl-0 text-[13px] font-normal hover:bg-transparent data-[state=open]:bg-transparent focus-visible:ring-0 focus-visible:outline-none cursor-pointer"
              onMouseDown={(e) => {
                e.preventDefault()
                setOpenId((prev) => (prev === m.id ? null : m.id))
              }}
              onMouseEnter={() => {
                setOpenId((prev) => (prev && prev !== m.id ? m.id : prev))
              }}
              onClick={(e) => {
                // Prevent Radix toggling after we already set controlled state on mousedown
                e.preventDefault()
                e.stopPropagation()
              }}
              aria-expanded={openId === m.id}
            >
              {m.label}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="z-40 p-0">
            {typeof m.content === "function" ? m.content({ uiStore }) : m.content}
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}

export default EntityMenu
