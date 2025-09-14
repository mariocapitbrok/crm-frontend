"use client"

import * as React from "react"
import type { EntityUiState, HeaderLayout } from "@/state/stores/createEntityUiStore"
import {
  Menubar as UiMenubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
} from "@/components/ui/menubar"
import { useDefaultEntityUiStore } from "@/state/stores/defaultEntityUiStore"

export type UiStoreHook = <T>(selector: (s: EntityUiState) => T) => T

export type MenuRenderCtx = { uiStore: UiStoreHook }

export type MenuSpec = {
  id: string
  label: string
  content?: React.ReactNode | ((ctx: MenuRenderCtx) => React.ReactNode)
}

export type EntityMenuProps = {
  uiStore?: UiStoreHook
  menus?: MenuSpec[]
}

export function buildDefaultMenus(uiStore: UiStoreHook): MenuSpec[] {
  const store = uiStore
  const labels = ["File", "Edit", "View", "Insert", "Format", "Data", "Tools", "Extensions", "Help"]
  const viewSpec: MenuSpec = {
    id: "view",
    label: "View",
    content: () => {
      const headerLayout = store((s) => s.headerLayout)
      const setHeaderLayout = store((s) => s.setHeaderLayout)
      const layoutOptions: { value: HeaderLayout; label: string }[] = [
        { value: "split", label: "Split filters" },
        { value: "popover", label: "Popover filters" },
      ]
      return (
        <div className="w-56 p-1">
          <MenubarLabel>Table header</MenubarLabel>
          <MenubarRadioGroup value={headerLayout} onValueChange={(v) => setHeaderLayout(v as HeaderLayout)}>
            {layoutOptions.map((opt) => (
              <MenubarRadioItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenubarRadioItem>
            ))}
          </MenubarRadioGroup>
        </div>
      )
    },
  }

  const defaultContent = (label: string) => (
    <div className="w-56 p-1">
      <MenubarLabel>{label}</MenubarLabel>
      <MenubarItem disabled>Coming soon</MenubarItem>
    </div>
  )

  return labels.map((label) => {
    const id = label.toLowerCase()
    if (id === "view") return viewSpec
    return { id, label, content: defaultContent(label) }
  })
}

const EntityMenu = ({ uiStore, menus }: EntityMenuProps) => {
  const store = uiStore ?? useDefaultEntityUiStore
  const items = menus ?? buildDefaultMenus(store)

  // Controlled active menu; empty string means none open
  const [activeId, setActiveId] = React.useState<string>("")
  // Enable hover-to-switch only after an intentional open
  const hoverSwitchEnabled = React.useRef(false)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = React.useCallback(() => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const scheduleClose = React.useCallback(() => {
    // close a short moment after pointer leaves, to feel natural
    cancelClose()
    closeTimer.current = setTimeout(() => {
      hoverSwitchEnabled.current = false
      setActiveId("")
    }, 150)
  }, [cancelClose])

  const ContentOpenWatcher = (props: React.ComponentProps<typeof MenubarContent>) => {
    const { onEscapeKeyDown, onPointerDownOutside, ...rest } = props
    return (
      <MenubarContent
        {...rest}
        onEscapeKeyDown={(e) => {
          hoverSwitchEnabled.current = false
          setActiveId("")
          onEscapeKeyDown?.(e)
        }}
        onPointerDownOutside={(e) => {
          hoverSwitchEnabled.current = false
          setActiveId("")
          onPointerDownOutside?.(e)
        }}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      />
    )
  }

  return (
    <UiMenubar
      className="gap-1 border-none p-0"
      value={activeId}
      onValueChange={(v) => {
        // Only allow Menubar to change the active menu while hover-switch is enabled
        if (hoverSwitchEnabled.current) setActiveId(v)
      }}
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      {items.map((m) => (
        <MenubarMenu key={m.id} value={m.id}>
          <MenubarTrigger
            className="cursor-pointer"
            onPointerDown={() => {
              hoverSwitchEnabled.current = true
              setActiveId(m.id)
            }}
            onMouseEnter={() => {
              if (hoverSwitchEnabled.current) setActiveId(m.id)
            }}
          >
            {m.label}
          </MenubarTrigger>
          <ContentOpenWatcher align="start">
            {typeof m.content === "function" ? m.content({ uiStore: store }) : m.content}
          </ContentOpenWatcher>
        </MenubarMenu>
      ))}
    </UiMenubar>
  )
}

export default EntityMenu
