import { FileSpreadsheet } from "lucide-react"
import AddRecord from "./AddRecord"
import EntityTitle from "./EntityTitle"
import ImportRecords from "./ImportRecords"
import LeadsMenu from "./LeadsMenu"

const EntityNavBar = () => {
  return (
    <section className="w-full border-b bg-background text-foreground">
      <div className="flex items-center justify-between gap-3 px-4 py-1">
        {/* Left: file icon, then a column with title and menus */}
        <div className="flex min-w-0 items-center gap-3">
          <FileSpreadsheet className="size-7" />
          <div className="min-w-0 flex flex-col">
            <EntityTitle>Leads</EntityTitle>
            <LeadsMenu />
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2">
          <AddRecord entity="Lead" buttonProps={{ className: "text-[13px]" }} />
          <ImportRecords
            entity="Leads"
            buttonText="Import"
            buttonProps={{ className: "text-[13px]" }}
          />
        </div>
      </div>
    </section>
  )
}

export default EntityNavBar
