import { createElement, type ReactNode } from "react"
import { FileSpreadsheet } from "lucide-react"
import { useDefaultEntityUiStore } from "@/state/stores/defaultEntityUiStore"
import { useContactsUiStore } from "@/state/stores/contactsUiStore"
import type { MenuSpec } from "@/components/EntityMenu"
import { buildDefaultMenus } from "@/components/EntityMenu"

export type EntityKey = "leads" | "contacts" | "deals" | "organizations"

export type EntityConfig = {
  key: EntityKey
  title: string
  icon?: ReactNode
  uiStore: <T>(sel: (s: any) => T) => T
  menus?: MenuSpec[]
  actions?: ReactNode
}

const baseIcon = createElement(FileSpreadsheet, { className: "size-7" })

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
    uiStore: useContactsUiStore,
    menus: buildDefaultMenus(useContactsUiStore),
  },
  deals: {
    key: "deals",
    title: "Deals",
    icon: baseIcon,
    uiStore: useDefaultEntityUiStore,
    menus: buildDefaultMenus(useDefaultEntityUiStore),
  },
  organizations: {
    key: "organizations",
    title: "Organizations",
    icon: baseIcon,
    uiStore: useDefaultEntityUiStore,
    menus: buildDefaultMenus(useDefaultEntityUiStore),
  },
}

export function getEntityConfig(key: EntityKey): EntityConfig {
  return entityRegistry[key]
}
