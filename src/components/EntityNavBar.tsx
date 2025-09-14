import { FileSpreadsheet } from "lucide-react"
import AddRecord from "./AddRecord"
import EntityTitle from "./EntityTitle"
import ImportRecords from "./ImportRecords"
import EntityMenu from "@/components/entity-menu"
import * as React from "react"

type EntityNavBarProps = {
  title?: React.ReactNode
  menu?: React.ReactNode
  actions?: React.ReactNode
  icon?: React.ReactNode
  entitySingular?: string
  entityPlural?: string
}

const EntityNavBar: React.FC<EntityNavBarProps> = ({
  title,
  menu,
  actions,
  icon,
  entitySingular,
  entityPlural,
}) => {
  const singular = entitySingular ?? "Lead"
  const plural = entityPlural ?? (entitySingular ? `${entitySingular}s` : "Leads")
  const defaultTitle = <EntityTitle>{plural}</EntityTitle>
  const defaultMenu = <EntityMenu />
  const defaultActions = (
    <>
      <AddRecord entity={singular} buttonProps={{ className: "text-[13px]" }} />
      <ImportRecords entity={plural} buttonText="Import" buttonProps={{ className: "text-[13px]" }} />
    </>
  )

  return (
    <section className="w-full border-b bg-background text-foreground">
      <div className="flex items-center justify-between gap-3 px-4 py-1">
        {/* Left: icon, then a column with title and menus */}
        <div className="flex min-w-0 items-center gap-3">
          {icon ?? <FileSpreadsheet className="size-7" />}
          <div className="min-w-0 flex flex-col">
            {title ?? defaultTitle}
            {menu ?? defaultMenu}
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2">
          {actions ?? defaultActions}
        </div>
      </div>
    </section>
  )
}

export default EntityNavBar
