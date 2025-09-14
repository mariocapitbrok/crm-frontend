"use client"

import EntityMenu, { buildDefaultMenus } from "./EntityMenu"
import { useLeadsUiStore } from "@/state/stores/leadsUiStore"

const LeadsMenu = () => {
  const menus = buildDefaultMenus(useLeadsUiStore)
  return <EntityMenu uiStore={useLeadsUiStore} menus={menus} />
}

export default LeadsMenu
