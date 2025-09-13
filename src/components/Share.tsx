import { ChevronDown, Lock } from "lucide-react"
import { Button } from "./ui/button"

const Share = () => {
  return (
    <Button
      className="h-8 rounded-full bg-blue-100 text-blue-900 hover:bg-blue-200 px-4"
      aria-label="Share"
    >
      <Lock className="size-4" />
      Share
      <ChevronDown className="size-4" />
    </Button>
  )
}

export default Share
