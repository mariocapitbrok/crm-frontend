import AiIcon from "@/components/AiIcon"
import EntityTitle from "@/components/EntityTitle"
import JoinACall from "@/components/JoinACall"
import LeadsMenu from "@/components/LeadsMenu"
import Share from "@/components/Share"
import ShowComments from "@/components/ShowComments"
import ShowHistory from "@/components/ShowHistory"
import { FileSpreadsheet } from "lucide-react"

const Leads = () => {
  return (
    <section className="w-full border-b bg-background text-foreground">
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        {/* Left: file icon, then a column with title and menus */}
        <div className="flex min-w-0 items-center gap-3">
          <FileSpreadsheet className="size-7" />
          <div className="min-w-0 flex flex-col">
            <EntityTitle>Leads</EntityTitle>
            <LeadsMenu />
          </div>
        </div>

        {/* Right: icons, Share button, star, avatar */}
        <div className="flex items-center gap-2">
          <ShowHistory />
          <ShowComments />
          <JoinACall />
          <Share />
          <AiIcon />
        </div>
      </div>
    </section>
  )
}

export default Leads
