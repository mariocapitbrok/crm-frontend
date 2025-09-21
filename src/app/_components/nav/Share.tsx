import { ChevronDown, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

const Share = () => {
  return (
    <Button variant="secondary" className="inline-flex items-center gap-2" aria-label="Share">
      <Lock className="size-4" />
      <span className="text-sm">Share</span>
      <ChevronDown className="size-4" />
    </Button>
  )
}

export default Share
