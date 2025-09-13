import { ChevronDown, Video } from "lucide-react"
import { Button } from "./ui/button"

const JoinACall = () => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1 pr-2"
      aria-label="Meet options"
    >
      <Video className="size-4" />
      <ChevronDown className="size-4" />
    </Button>
  )
}

export default JoinACall
