"use client"

import {
  cloneElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  coreLeadFieldDefinitions,
  getDefaultRequiredLeadFieldIds,
  getDefaultVisibleLeadFieldIds,
  resolveLeadRequiredFields,
  resolveLeadVisibleFields,
  sanitizeLeadFieldIds,
} from "../domain/leadSchemas"
import {
  useCreateEntityField,
  useEntityFieldConfig,
  useEntityFields,
  useRemoveEntityField,
  useUpdateEntityFieldConfig,
  type EntityFieldDefinition,
} from "@/domains/entities/ui"
import type { FieldConfigUpdateInput } from "@/febe/fieldConfig"

const entityKey = "leads" as const

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

type ConfigureLeadFieldsDialogProps = {
  trigger?: ReactElement<{ disabled?: boolean }>
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const createFieldTypes = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
] as const

type CreateFieldType = (typeof createFieldTypes)[number]["value"]

export default function ConfigureLeadFieldsDialog({
  trigger,
  open: openProp,
  onOpenChange,
}: ConfigureLeadFieldsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next)
      }
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )
  const [hasStructureChanges, setHasStructureChanges] = useState(false)

  const { data: fetchedFields, isFetching: fieldsFetching } =
    useEntityFields(entityKey)

  const definitions = useMemo(() => {
    if (!fetchedFields) return coreLeadFieldDefinitions
    return fetchedFields.map((field: EntityFieldDefinition) => ({
      id: field.id,
      label: field.label,
      description: field.description,
      placeholder: field.placeholder,
      dataType: field.dataType,
      autoComplete: field.autoComplete,
      kind: field.kind,
      defaultRequired:
        field.defaultRequired ?? (field.kind === "core" && field.requiredBySystem),
      defaultVisible: field.defaultVisible ?? true,
    }))
  }, [fetchedFields])
  const sortedDefinitions = useMemo(() => {
    return [...definitions].sort((a, b) => {
      if (a.kind !== b.kind) {
        return a.kind === "core" ? -1 : 1
      }
      return a.label.localeCompare(b.label)
    })
  }, [definitions])

  const allowedIds = useMemo(
    () => sortedDefinitions.map((def) => def.id),
    [sortedDefinitions],
  )

  const defaultRequired = useMemo(
    () => getDefaultRequiredLeadFieldIds(sortedDefinitions),
    [sortedDefinitions],
  )

  const defaultVisible = useMemo(
    () => getDefaultVisibleLeadFieldIds(sortedDefinitions),
    [sortedDefinitions],
  )

  const { data: config, isFetching: configFetching } = useEntityFieldConfig(
    entityKey,
    { requiredFieldIds: defaultRequired, visibleFieldIds: defaultVisible },
  )
  const updateConfig = useUpdateEntityFieldConfig(entityKey)

  const remoteRequired = useMemo(() => {
    return resolveLeadRequiredFields(config?.requiredFieldIds, sortedDefinitions)
  }, [config?.requiredFieldIds, sortedDefinitions])

  const remoteVisible = useMemo(() => {
    return resolveLeadVisibleFields(config?.visibleFieldIds, sortedDefinitions)
  }, [config?.visibleFieldIds, sortedDefinitions])

  const [localRequired, setLocalRequired] = useState<string[]>(remoteRequired)
  const [localVisible, setLocalVisible] = useState<string[]>(remoteVisible)

  useEffect(() => {
    setLocalRequired((current) => {
      const sanitized = sanitizeLeadFieldIds(current, sortedDefinitions)
      return arraysEqual(current, sanitized) ? current : sanitized
    })
  }, [sortedDefinitions])

  useEffect(() => {
    setLocalRequired((current) =>
      arraysEqual(current, remoteRequired) ? current : remoteRequired,
    )
  }, [remoteRequired])

  useEffect(() => {
    setLocalVisible((current) => {
      const sanitized = sanitizeLeadFieldIds(current, sortedDefinitions)
      return arraysEqual(current, sanitized) ? current : sanitized
    })
  }, [sortedDefinitions])

  useEffect(() => {
    setLocalVisible((current) =>
      arraysEqual(current, remoteVisible) ? current : remoteVisible,
    )
  }, [remoteVisible])

  const triggerDisabled = trigger?.props.disabled ?? false
  const removingLocked = localRequired.length <= 1
  const visibleLocked = localVisible.length <= 1
  const requiredDirty = !arraysEqual(localRequired, remoteRequired)
  const visibleDirty = !arraysEqual(localVisible, remoteVisible)
  const disableSave =
    updateConfig.isPending || (!requiredDirty && !visibleDirty && !hasStructureChanges)

  const handleToggleRequired = (fieldId: string, nextValue: boolean) => {
    setLocalRequired((current) => {
      if (nextValue) {
        const merged = current.includes(fieldId)
          ? current
          : [...current, fieldId]
        return allowedIds.filter((id) => merged.includes(id))
      }
      if (current.length <= 1) return current
      const filtered = current.filter((id) => id !== fieldId)
      return filtered.length > 0 ? filtered : current
    })
    if (nextValue) {
      setLocalVisible((current) =>
        current.includes(fieldId) ? current : [...current, fieldId],
      )
    }
  }

  const handleToggleVisible = (fieldId: string, nextValue: boolean) => {
    setLocalVisible((current) => {
      if (nextValue) {
        const merged = current.includes(fieldId)
          ? current
          : [...current, fieldId]
        return allowedIds.filter((id) => merged.includes(id))
      }
      if (current.length <= 1) return current
      const filtered = current.filter((id) => id !== fieldId)
      return filtered.length > 0 ? filtered : current
    })
  }

  const handleSave = async () => {
    const payload: FieldConfigUpdateInput = {
      requiredFieldIds: localRequired,
      visibleFieldIds: localVisible,
    }
    if (requiredDirty || visibleDirty) {
      await updateConfig.mutateAsync(payload)
    }
    setHasStructureChanges(false)
    setOpen(false)
  }

  const createField = useCreateEntityField(entityKey)
  const removeField = useRemoveEntityField(entityKey)
  const [newFieldLabel, setNewFieldLabel] = useState("")
  const [newFieldType, setNewFieldType] = useState<CreateFieldType>("text")
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)

  const handleAddField = async () => {
    if (!newFieldLabel.trim()) return
    const created = await createField.mutateAsync({
      label: newFieldLabel.trim(),
      dataType: newFieldType,
    })
    setLocalVisible((current) =>
      created.defaultVisible !== false && !current.includes(created.id)
        ? [...current, created.id]
        : current,
    )
    setHasStructureChanges(true)
    setNewFieldLabel("")
    setNewFieldType("text")
  }

  const handleRemoveField = async (fieldId: string) => {
    setRemoveTarget(fieldId)
    try {
      await removeField.mutateAsync(fieldId)
      setLocalRequired((current) => current.filter((id) => id !== fieldId))
      setLocalVisible((current) => current.filter((id) => id !== fieldId))
      setHasStructureChanges(true)
    } finally {
      setRemoveTarget(null)
    }
  }

  const creationDisabled =
    createField.isPending || !newFieldLabel.trim() || fieldsFetching

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setLocalRequired(remoteRequired)
          setLocalVisible(remoteVisible)
          setHasStructureChanges(false)
        }
      }}
    >
      {trigger ? (
        <DialogTrigger asChild>
          {cloneElement(trigger, {
            disabled:
              updateConfig.isPending || createField.isPending || triggerDisabled,
          })}
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-lg sm:max-w-xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Configure entity fields</DialogTitle>
          <DialogDescription>
            Manage which fields appear in the lead creation form and mark them as
            required.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-10rem)] pr-1">
          <div className="space-y-6 pr-2">
            <section className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Required fields</h3>
                <p className="text-xs text-muted-foreground">
                  System fields cannot be deleted. Keep at least one field
                  required.
                </p>
              </div>

              <div className="space-y-3">
              {sortedDefinitions.map((field) => {
                const isRequired = localRequired.includes(field.id)
                const isVisible = localVisible.includes(field.id)
                const requiredToggleDisabled =
                  updateConfig.isPending ||
                  configFetching ||
                  fieldsFetching ||
                  (isRequired && removingLocked)
                const visibleToggleDisabled =
                  updateConfig.isPending ||
                  configFetching ||
                  fieldsFetching ||
                  isRequired ||
                  (isVisible && visibleLocked)

                const isRemoving =
                  removeTarget === field.id && removeField.isPending

                return (
                  <div
                    key={field.id}
                    className="flex items-start justify-between gap-4 rounded-md border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {field.label}
                      </p>
                        <p className="text-xs text-muted-foreground">
                          {field.kind === "core"
                            ? "Core field"
                            : "Custom field"}
                        </p>
                        {field.description ? (
                          <p className="text-xs text-muted-foreground">
                            {field.description}
                          </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-2 text-xs">
                        <label className="flex items-center gap-2">
                          <span>Required</span>
                          <Switch
                            checked={isRequired}
                            disabled={requiredToggleDisabled}
                            onCheckedChange={(checked) =>
                              handleToggleRequired(field.id, checked)
                            }
                            aria-label={
                              isRequired
                                ? `Mark ${field.label} optional`
                                : `Mark ${field.label} required`
                            }
                          />
                        </label>
                        <label className="flex items-center gap-2">
                          <span>Show by default</span>
                          <Switch
                            checked={isVisible}
                            disabled={visibleToggleDisabled}
                            onCheckedChange={(checked) =>
                              handleToggleVisible(field.id, checked)
                            }
                            aria-label={
                              isVisible
                                ? `Hide ${field.label} by default`
                                : `Show ${field.label} by default`
                            }
                          />
                        </label>
                      </div>
                      {field.kind === "custom" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => handleRemoveField(field.id)}
                            disabled={removeField.isPending}
                            aria-label={`Remove ${field.label}`}
                          >
                            {isRemoving ? (
                              <Loader2
                                className="size-4 animate-spin"
                                aria-hidden
                              />
                            ) : (
                              <Trash2 className="size-4" aria-hidden />
                            )}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              {localRequired.length <= 1 ? (
                <p className="text-xs text-muted-foreground">
                  Keep at least one field required.
                </p>
              ) : null}
              {localVisible.length <= 1 ? (
                <p className="text-xs text-muted-foreground">
                  Keep at least one field visible by default.
                </p>
              ) : null}
              {removeField.error ? (
                <p className="text-sm text-destructive">
                  {removeField.error instanceof Error
                    ? removeField.error.message
                    : String(removeField.error)}
                  </p>
                ) : null}
                {updateConfig.error ? (
                  <p className="text-sm text-destructive">
                    {updateConfig.error instanceof Error
                      ? updateConfig.error.message
                      : String(updateConfig.error)}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Add custom field</h3>
                <p className="text-xs text-muted-foreground">
                  Custom fields are optional by default. You can mark them required
                  above after creation.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-[2fr,1fr]">
                <Input
                  placeholder="Label"
                  value={newFieldLabel}
                  onChange={(event) => setNewFieldLabel(event.target.value)}
                  disabled={createField.isPending}
                />
                <Select
                  value={newFieldType}
                  onValueChange={(value) =>
                    setNewFieldType(value as CreateFieldType)
                  }
                  disabled={createField.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Field type" />
                  </SelectTrigger>
                  <SelectContent>
                    {createFieldTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {createField.error ? (
                <p className="text-sm text-destructive">
                  {createField.error instanceof Error
                    ? createField.error.message
                    : String(createField.error)}
                </p>
              ) : null}
              <Button
                type="button"
                onClick={handleAddField}
                disabled={creationDisabled}
              >
                {createField.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                ) : (
                  <Plus className="mr-2 size-4" aria-hidden />
                )}
                Add field
              </Button>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 border-t pt-4">
          <DialogClose asChild>
            <Button variant="ghost" type="button" disabled={updateConfig.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={disableSave}>
            {updateConfig.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            ) : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
