import EntityTitle from "@/components/EntityTitle"
import LeadsMenu from "@/components/LeadsMenu"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Plus, Download } from "lucide-react"

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
          <Button variant="outline" size="sm">
            <Plus className="size-4" />
            Add Lead
          </Button>
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            Import
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Leads
