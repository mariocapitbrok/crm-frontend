"use client"

import { ReactNode } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

type ImportRecordsProps = {
  entity?: string
  children?: ReactNode
  buttonText?: string
  icon?: React.ComponentType<{ className?: string }>
  buttonProps?: Omit<React.ComponentProps<typeof Button>, "children">
}

export default function ImportRecords({
  entity = "Records",
  children,
  buttonText,
  icon: Icon = Download,
  buttonProps,
}: ImportRecordsProps) {
  const label = buttonText ?? "Import"
  const title = `${label} ${entity}`

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" {...buttonProps}>
          <Icon className="size-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children ?? (
          <div className="text-sm text-muted-foreground">
            Import form for {entity} goes here.
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Import</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

