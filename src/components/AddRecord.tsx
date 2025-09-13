"use client"

import { ReactNode } from "react"
import { Plus } from "lucide-react"
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

type AddRecordProps = {
  entity: string
  children?: ReactNode
  buttonText?: string
  icon?: React.ComponentType<{ className?: string }>
  buttonProps?: Omit<React.ComponentProps<typeof Button>, "children">
}

export default function AddRecord({
  entity,
  children,
  buttonText,
  icon: Icon = Plus,
  buttonProps,
}: AddRecordProps) {
  const label = buttonText ?? `Add ${entity}`

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
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        {/* Content slot for the entity creation form */}
        {children ?? (
          <div className="text-sm text-muted-foreground">
            {/* Placeholder so the component is useful immediately */}
            Form for new {entity} goes here.
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

