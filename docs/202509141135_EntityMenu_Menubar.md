# EntityMenu — Desktop-Style Menubar with Hover Switching

This document explains the generic `EntityMenu` component, how it’s built on shadcn/ui Menubar, the “hover-to-switch” behavior, and how to extend it per entity.

## Goals

- Single, reusable top-level menu for all entities (File, Edit, View, Insert, Format, Data, Tools, Extensions, Help).
- Desktop-like UX (Google Sheets): click to open, then hover to switch between menus; hover does nothing when closed.
- Composable API: pass the entity store and optional menu specs; keep shared items in one place.

## Files

- `src/components/EntityMenu.tsx`
  - Generic, config-driven menubar for entities.
- `src/components/ui/menubar.tsx`
  - shadcn/ui wrapper for `@radix-ui/react-menubar` primitives.
- `src/components/EntityNavBar.tsx`
  - Uses `EntityMenu` as the default menubar.

## Core API

- `buildDefaultMenus(uiStore)` → `MenuSpec[]`

  - Returns the standard ordered set: File, Edit, View, Insert, Format, Data, Tools, Extensions, Help.
  - View menu includes a radio group to choose the table header layout (`split` vs `popover`) using the provided entity UI store.

- `<EntityMenu uiStore={optionalStore} menus={optionalCustomMenus} />`
  - `uiStore` (optional): per‑entity Zustand store created via `createEntityUiStore`.
    - If omitted, `EntityMenu` uses the shared default store: `useDefaultEntityUiStore`.
  - `menus` (optional): replace/extend defaults; if omitted, uses `buildDefaultMenus`.

### MenuSpec shape

- `{ id: string; label: string; content?: ReactNode | ((ctx: { uiStore }) => ReactNode) }`
- Content can be:
  - A static ReactNode
  - A render function that receives `{ uiStore }` for stateful items (e.g., radio groups)

## UX Behavior (Hover Switching)

- Intent-based switching: hover switches menus only after an intentional open.

  - Click (pointer down) on a menu label → menu opens and enables hover switching.
  - With a menu open, hovering another label switches the open menu instantly.
  - Closing (Escape or outside click) disables hover switching; hovering does nothing until the next intentional open.

- Implementation details (EntityMenu.tsx):
  - Controlled Menubar: `value={activeId}`; empty string means “none open”.
  - `hoverSwitchEnabled` (ref) guards when `onMouseEnter` and `onValueChange` are allowed to change the active menu.
  - Menubar content handlers (`onEscapeKeyDown`, `onPointerDownOutside`) reset the guard and clear `activeId`.

## Extending Menus Per Entity

- Start with defaults:
  - `const menus = buildDefaultMenus(useDefaultEntityUiStore)`
- Replace or augment by `id`:
  - Example: replace File menu for Leads with Import/Export items.
- Render helpers: use `MenubarItem`, `MenubarSeparator`, `MenubarRadioGroup`, etc., from `src/components/ui/menubar.tsx` to keep styles consistent.

## Example: Default usage

```ts
import EntityMenu from "./EntityMenu"

export default function MenuBar() {
  // Uses the default store under the hood
  return <EntityMenu />
}
```

## Example: Custom store (optional)

```ts
import EntityMenu, { buildDefaultMenus } from "./EntityMenu"
import { useContactsUiStore } from "@/state/stores/contactsUiStore"

export default function ContactsMenu() {
  const menus = buildDefaultMenus(useContactsUiStore)
  return <EntityMenu uiStore={useContactsUiStore} menus={menus} />
}
```

## Notes & Accessibility

- Menubar provides keyboard support out of the box (Arrow keys, Escape, Enter/Space).
- Triggers use `cursor-pointer` for clear affordance.
- Components are client-side (`"use client"`) and use Radix primitives under shadcn wrappers.

## Future Enhancements

- Central entity registry to define per‑entity menus/actions in one place.
- Add submenu patterns and keyboard shortcuts (e.g., `⌘O`, `Ctrl+O`).
- Replace “Coming soon” with real actions (Import/Export, Density, Theme, etc.).

## Entity Registry (Pattern)

Centralize per‑entity wiring (title, icon, UI store, menu overrides, and actions) in a single map. This reduces per‑page boilerplate and makes adding entities predictable.

Suggested file: `src/entities/registry.ts`

```ts
import { FileSpreadsheet } from "lucide-react"
import EntityMenu, {
  buildDefaultMenus,
  type MenuSpec,
} from "@/components/EntityMenu"
import { useDefaultEntityUiStore } from "@/state/stores/defaultEntityUiStore"
import { useContactsUiStore } from "@/state/stores/contactsUiStore" // optional example

export type EntityKey = "leads" | "contacts" | "deals" | "organizations"

export type EntityConfig = {
  key: EntityKey
  title: string
  icon?: React.ReactNode
  uiStore: <T>(sel: (s: any) => T) => T
  menus?: MenuSpec[] // optional overrides/augments
  actions?: React.ReactNode // optional right-side actions for the navbar
}

const baseIcon = <FileSpreadsheet className="size-7" />

export const entityRegistry: Record<EntityKey, EntityConfig> = {
  leads: {
    key: "leads",
    title: "Leads",
    icon: baseIcon,
    uiStore: useDefaultEntityUiStore,
    menus: buildDefaultMenus(useDefaultEntityUiStore),
  },
  contacts: {
    key: "contacts",
    title: "Contacts",
    icon: baseIcon,
    uiStore: useContactsUiStore, // custom store example
    menus: buildDefaultMenus(useContactsUiStore),
  },
}

export function getEntityConfig(key: EntityKey): EntityConfig {
  return entityRegistry[key]
}
```

Usage in a page:

```ts
import EntityNavBar from "@/components/EntityNavBar"
import EntityMenu from "@/components/EntityMenu"
import { getEntityConfig } from "@/entities/registry"

const cfg = getEntityConfig("leads")

<EntityNavBar
  title={cfg.title}
  icon={cfg.icon}
  menu={<EntityMenu uiStore={cfg.uiStore} menus={cfg.menus} />}
  entitySingular="Lead"
  entityPlural={cfg.title}
/>
```

Notes

- If an entity has no special needs, point `uiStore` to `useDefaultEntityUiStore` and omit `menus` to use the defaults.
- When adding custom actions (e.g., Import/Export variants), return them via `cfg.actions` and pass to `EntityNavBar`.
- Registry can be extended later with routes, permissions, and feature flags per entity.

## Troubleshooting

- Menu closes too aggressively when moving diagonally from the trigger to the content
  - Increase the close delay in `EntityMenu.tsx` (inside `scheduleClose`, default 150ms). Try 200–250ms.
- Menu lingers open after leaving the area
  - Decrease the close delay in `EntityMenu.tsx` (e.g., 80–120ms) so it dismisses faster on pointer leave.
