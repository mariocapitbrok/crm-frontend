"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { EntityKey } from "@/entities/registry"
import type { SavedView, ViewDefinition } from "@/febe/types"
import {
  useCreateSavedView,
  useDeleteSavedView,
  useSavedViews,
  useUpdateSavedView,
} from "@/state/queries/views"
import { Plus, RotateCcw, Save as SaveIcon, Trash2, Edit } from "lucide-react"
import * as React from "react"

export type SavedViewPickerProps = {
  entity: EntityKey
  activeViewId: number | null
  onSelectView: (view: SavedView | null) => void
  getCurrentDefinition: () => ViewDefinition
  onResetToDefault?: () => void
  isDirty?: boolean
}

export function SavedViewPicker({
  entity,
  activeViewId,
  onSelectView,
  getCurrentDefinition,
  onResetToDefault,
  isDirty,
}: SavedViewPickerProps) {
  const { data: views = [], isLoading } = useSavedViews(entity)
  const createMut = useCreateSavedView()
  const updateMut = useUpdateSavedView()
  const deleteMut = useDeleteSavedView()

  const [saveOpen, setSaveOpen] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [renameOpen, setRenameOpen] = React.useState(false)
  const [renameValue, setRenameValue] = React.useState("")

  const active = views.find((v) => v.id === activeViewId) || null

  const handleSaveNew = async () => {
    const name = newName.trim()
    if (!name) return
    const def = getCurrentDefinition()
    const res = await createMut.mutateAsync({ entity, name, definition: def })
    setSaveOpen(false)
    setNewName("")
    onSelectView(res)
  }

  const handleUpdate = async () => {
    if (!active) return
    const def = getCurrentDefinition()
    const res = await updateMut.mutateAsync({
      id: active.id,
      patch: { definition: def },
    })
    onSelectView(res)
  }

  const handleDelete = async () => {
    if (!active) return
    await deleteMut.mutateAsync({ id: active.id, entity })
    onSelectView(null)
  }

  const value = active ? String(active.id) : "none"

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value}
        onValueChange={(v) => {
          if (v === "none") {
            onSelectView(null)
          } else {
            const id = Number(v)
            const found = views.find((sv) => sv.id === id) || null
            onSelectView(found)
          }
        }}
        disabled={isLoading}
      >
        <SelectTrigger className="h-8 w-[210px] text-[13px]">
          <SelectValue placeholder="Select a view" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Views</SelectLabel>
            <SelectItem value="none">Default View</SelectItem>
            {views.map((v) => (
              <SelectItem key={v.id} value={String(v.id)}>
                {v.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {isDirty && (
        <Badge variant="secondary" className="h-6 px-2 text-[11px]">
          Unsaved
        </Badge>
      )}

      {/* Save as New (only when dirty) */}
      {isDirty && (
        <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="size-8"
              aria-label="Save as New"
              title="Save as New"
            >
              <Plus className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Save View</DialogTitle>
              <DialogDescription>Give this view a name.</DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Assigned to Do Ut"
                className="h-8"
              />
              <Button
                size="sm"
                onClick={handleSaveNew}
                disabled={!newName.trim() || createMut.isPending}
              >
                {createMut.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reset visible when a view is selected or there are dirty changes */}
      {(Boolean(isDirty) || activeViewId !== null) && (
        <Button
          size="icon"
          variant="outline"
          className="size-8"
          onClick={() => onResetToDefault?.()}
          aria-label="Reset to default"
          title="Reset to default"
        >
          <RotateCcw className="size-4" />
        </Button>
      )}

      {/* Update visible only for active view with dirty changes */}
      {active && isDirty && (
        <Button
          size="icon"
          variant="outline"
          className="size-8"
          onClick={handleUpdate}
          disabled={updateMut.isPending}
          aria-label="Update view"
          title="Update view"
        >
          <SaveIcon className="size-4" />
        </Button>
      )}

      {/* Rename visible only when a view is selected */}
      {active && (
        <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="size-8"
              onClick={() => setRenameValue(active.name)}
              aria-label="Rename view"
              title="Rename view"
            >
              <Edit className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Rename View</DialogTitle>
              <DialogDescription>Change the name of this view.</DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="New view name"
                className="h-8"
              />
              <Button
                size="sm"
                onClick={async () => {
                  const name = renameValue.trim()
                  if (!name || !active || name === active.name) return
                  const res = await updateMut.mutateAsync({ id: active.id, patch: { name } })
                  onSelectView(res)
                  setRenameOpen(false)
                }}
                disabled={!renameValue.trim() || renameValue.trim() === active?.name || updateMut.isPending}
              >
                {updateMut.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete visible only when a view is selected */}
      {active && (
        <Button
          size="icon"
          variant="destructive"
          className="size-8"
          onClick={handleDelete}
          disabled={deleteMut.isPending}
          aria-label="Delete view"
          title="Delete this view"
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  )
}

export default SavedViewPicker

