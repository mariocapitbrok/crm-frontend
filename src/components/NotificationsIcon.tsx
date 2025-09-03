import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function NotificationsIcon() {
  return (
    <div className="relative">
      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="w-5 h-5" />
      </Button>
      <Badge className="absolute -top-0.5 -right-0.5 h-2 w-2 p-0 rounded-full" />
    </div>
  )
}
