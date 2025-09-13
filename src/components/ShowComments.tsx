import { MessageSquareText } from "lucide-react"
import { Button } from "./ui/button"

const ShowComments = () => {
  return (
    <Button variant="ghost" size="icon" aria-label="Comments">
      <MessageSquareText />
    </Button>
  )
}

export default ShowComments
