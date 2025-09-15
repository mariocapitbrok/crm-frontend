"use client"

import * as React from "react"
import type { EntityColumn } from "../types"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogTrigger,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

export function ColumnManagerDialog<T>(props: {
  allColumns: EntityColumn<T>[]
  order: string[]
  visibleIds: Set<string>
  onToggleVisible: (id: string, checked: boolean) => void
  onMoveColumn: (id: string, delta: number) => void
}) {
  const { allColumns, order, visibleIds, onToggleVisible, onMoveColumn } = props
  const [open, setOpen] = React.useState(false)
  const [localOrder, setLocalOrder] = React.useState<string[]>(order)

  React.useEffect(() => {
    setLocalOrder(order)
  }, [order, open])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const byId = React.useMemo(() => new Map(allColumns.map((c) => [c.id, c])), [allColumns])

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = localOrder.indexOf(String(active.id))
    const to = localOrder.indexOf(String(over.id))
    if (from < 0 || to < 0) return
    setLocalOrder((prev) => arrayMove(prev, from, to))
    // Move in parent state in a single operation (supports multi-step delta)
    onMoveColumn(String(active.id), to - from)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start px-2 py-1.5 text-left text-sm">
          Customize Columns…
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Columns</DialogTitle>
          <DialogDescription>
            Reorder and toggle column visibility.
          </DialogDescription>
        </DialogHeader>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={localOrder} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {localOrder.map((id) => {
                const col = byId.get(id)
                if (!col) return null
                return (
                  <SortableRow
                    key={id}
                    id={id}
                    label={col.header}
                    checked={visibleIds.has(id)}
                    onToggleVisible={onToggleVisible}
                  />
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
        <div className="mt-3 flex justify-end">
          <Button onClick={() => setOpen(false)} size="sm">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SortableRow(props: {
  id: string
  label: string
  checked: boolean
  onToggleVisible: (id: string, checked: boolean) => void
}) {
  const { id, label, checked, onToggleVisible } = props
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-md border bg-background p-2">
      <button
        aria-label="Drag"
        className="cursor-grab p-1 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <span className="flex-1 truncate text-sm">{label}</span>
      <label className="flex items-center gap-1 text-xs">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggleVisible(id, e.target.checked)}
        />
        Visible
      </label>
    </div>
  )
}
