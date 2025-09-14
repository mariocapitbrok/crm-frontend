"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

export function RowActions(props: { children?: React.ReactNode }) {
  const { children } = props
  if (children) return <>{children}</>
  return (
    <Button variant="ghost" size="icon" className="size-6">
      <MoreHorizontal className="size-4" />
    </Button>
  )
}
