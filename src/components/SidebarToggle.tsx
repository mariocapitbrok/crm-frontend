import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SidebarToggle() {
  return (
    <Button variant="ghost" size="icon" aria-label="Toggle sidebar">
      <Menu className="w-5 h-5" />
    </Button>
  )
}
