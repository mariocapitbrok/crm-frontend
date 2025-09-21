"use client"

import {
  cloneElement,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react"
import { Loader2 } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import {
  defaultRequiredLeadFieldIds,
  leadFieldDefinitions,
  resolveLeadRequiredFields,
  type LeadFieldId,
} from "../domain/leadSchemas"
import {
  useEntityFieldConfig,
  useUpdateEntityFieldConfig,
} from "@/domains/entities/ui"

const entityKey = "leads" as const
const orderedFieldIds = leadFieldDefinitions.map((field) => field.id)

function normalizeOrder(ids: LeadFieldId[]): LeadFieldId[] {
  return orderedFieldIds.filter((id) => ids.includes(id))
}

function arraysEqual(a: LeadFieldId[], b: LeadFieldId[]) {
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

type ConfigureLeadFieldsDialogProps = {
  trigger: ReactElement<{ disabled?: boolean }>
}

export default function ConfigureLeadFieldsDialog({
  trigger,
}: ConfigureLeadFieldsDialogProps) {
  const [open, setOpen] = useState(false)
  const { data, isFetching } = useEntityFieldConfig(entityKey, {
    requiredFieldIds: defaultRequiredLeadFieldIds,
  })
  const mutation = useUpdateEntityFieldConfig(entityKey)

  const triggerDisabled = trigger.props.disabled ?? false

  const remoteRequired = useMemo(() => {
    return normalizeOrder(
      resolveLeadRequiredFields(data?.requiredFieldIds ?? null),
    )
  }, [data?.requiredFieldIds])

  const [localRequired, setLocalRequired] = useState<LeadFieldId[]>(
    remoteRequired,
  )

  useEffect(() => {
    setLocalRequired((current) =>
      arraysEqual(current, remoteRequired) ? current : remoteRequired,
    )
  }, [remoteRequired])

  const removingLocked = localRequired.length <= 1
  const disableSave =
    mutation.isPending || arraysEqual(localRequired, remoteRequired)

  const handleToggle = (fieldId: LeadFieldId, nextValue: boolean) => {
    setLocalRequired((current) => {
      if (nextValue) {
        const merged = current.includes(fieldId)
          ? current
          : [...current, fieldId]
        return normalizeOrder(merged)
      }
      if (current.length <= 1) return current
      return current.filter((id) => id !== fieldId)
    })
  }

  const handleSave = async () => {
    await mutation.mutateAsync({
      requiredFieldIds: localRequired,
    })
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setLocalRequired(remoteRequired)
        }
      }}
    >
      <DialogTrigger asChild>
        {cloneElement(trigger, {
          disabled: mutation.isPending || triggerDisabled,
        })}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure entity fields</DialogTitle>
          <DialogDescription>
            Pick which fields stay required when teammates create leads.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {leadFieldDefinitions.map((field) => {
            const isRequired = localRequired.includes(field.id)
            const disableToggle =
              mutation.isPending || (isRequired && removingLocked)
            return (
              <div
                key={field.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {field.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isRequired
                      ? "Required and visible in the create form."
                      : "Optional and hidden by default."}
                  </p>
                  {field.description ? (
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  ) : null}
                </div>
                <Switch
                  checked={isRequired}
                  disabled={disableToggle || isFetching}
                  onCheckedChange={(checked) => handleToggle(field.id, checked)}
                  aria-label={
                    isRequired
                      ? `Mark ${field.label} optional`
                      : `Mark ${field.label} required`
                  }
                />
              </div>
            )
          })}
          {localRequired.length <= 1 ? (
            <p className="text-xs text-muted-foreground">
              Keep at least one field required.
            </p>
          ) : null}
          {mutation.error ? (
            <p className="text-sm text-destructive">
              {mutation.error instanceof Error
                ? mutation.error.message
                : String(mutation.error)}
            </p>
          ) : null}
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="ghost" type="button" disabled={mutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={disableSave}>
            {mutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            ) : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
