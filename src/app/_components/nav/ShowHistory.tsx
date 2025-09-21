import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

const ShowHistory = () => {
  return (
    <Button variant="ghost" size="icon" aria-label="Version history">
      <Clock />
    </Button>
  )
}

export default ShowHistory
