import * as React from "react"
import { cn } from "@/lib/utils"

type EntityTitleProps = {
  children: React.ReactNode
  className?: string
}

const EntityTitle = ({ children, className }: EntityTitleProps) => {
  return (
    <div className={cn("truncate text-sm font-medium leading-5", className)}>
      {children}
    </div>
  )
}

export default EntityTitle
