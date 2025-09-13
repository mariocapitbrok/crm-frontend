import AddRecord from "@/components/AddRecord"
import EntityTitle from "@/components/EntityTitle"
import ImportRecords from "@/components/ImportRecords"
import LeadsMenu from "@/components/LeadsMenu"
import { FileSpreadsheet } from "lucide-react"

const Leads = () => {
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
          <AddRecord entity="Lead" />
          <ImportRecords entity="Leads" buttonText="Import" />
        </div>
      </div>
    </section>
  )
}

export default Leads
