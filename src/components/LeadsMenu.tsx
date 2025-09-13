"use client"

import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLeadsUiStore, type HeaderLayout } from "@/state/stores/leadsUiStore"

const LeadsMenu = () => {
  const headerLayout = useLeadsUiStore((s) => s.headerLayout)
  const setHeaderLayout = useLeadsUiStore((s) => s.setHeaderLayout)

  const menusLeft = ["File", "Edit", "Insert", "Format", "Data"]
  const menusRight = ["Tools", "Extensions", "Help"]
  const layoutOptions: { value: HeaderLayout; label: string }[] = [
    { value: "split", label: "Split filters" },
    { value: "popover", label: "Popover filters" },
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 pt-1">
      {/* Static menus before View */}
      {menusLeft.map((label) => (
        <Button
          key={label}
          variant="ghost"
          size="sm"
          className="h-4 px-2 first:pl-0 text-[13px] font-normal"
        >
          {label}
        </Button>
      ))}

      {/* View menu with layout selection */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 px-2 text-[13px] font-normal"
            aria-label="View menu"
          >
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Table header</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={headerLayout}
            onValueChange={(v) => setHeaderLayout(v as HeaderLayout)}
          >
            {layoutOptions.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Static menus after View */}
      {menusRight.map((label) => (
        <Button
          key={label}
          variant="ghost"
          size="sm"
          className="h-4 px-2 text-[13px] font-normal"
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

export default LeadsMenu
