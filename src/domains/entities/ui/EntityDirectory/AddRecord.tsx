"use client"

import {
  ComponentProps,
  ComponentType,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react"
import { Plus, Loader2 } from "lucide-react"
import { z, ZodTypeAny } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  DeepPartial,
  SubmitHandler,
  UseFormReturn,
  useForm,
} from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"

type AddRecordSubmitHelpers<TValues> = {
  close: () => void
  reset: (values?: DeepPartial<TValues>) => void
  form: UseFormReturn<TValues>
}

type AddRecordRenderForm<TValues> = (
  form: UseFormReturn<TValues>,
) => ReactNode

type BaseAddRecordProps<TSchema extends ZodTypeAny> = {
  entity: string
  schema?: TSchema
  renderForm?: AddRecordRenderForm<z.infer<TSchema>>
  onSubmit?: (
    values: z.infer<TSchema>,
    helpers: AddRecordSubmitHelpers<z.infer<TSchema>>,
  ) => Promise<void> | void
  defaultValues?: DeepPartial<z.infer<TSchema>>
  buttonText?: string
  submitLabel?: string
  cancelLabel?: string
  title?: string
  description?: string
  icon?: ComponentType<{ className?: string }>
  buttonProps?: Omit<ComponentProps<typeof Button>, "children">
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: (values: z.infer<TSchema>) => void
  onError?: (error: unknown) => void
  autoCloseOnSuccess?: boolean
  autoResetOnClose?: boolean
  renderAfterForm?: ReactNode
  children?: ReactNode
}

export type AddRecordProps<TSchema extends ZodTypeAny> = BaseAddRecordProps<TSchema>

export default function AddRecord<TSchema extends ZodTypeAny>({
  entity,
  schema,
  renderForm,
  onSubmit,
  defaultValues,
  buttonText,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  title,
  description,
  icon: Icon = Plus,
  buttonProps,
  open,
  onOpenChange,
  onSuccess,
  onError,
  autoCloseOnSuccess = true,
  autoResetOnClose = true,
  renderAfterForm,
  children,
}: AddRecordProps<TSchema>) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isControlled = open !== undefined
  const dialogOpen = isControlled ? open : internalOpen
  const isConfigured = Boolean(schema && renderForm && onSubmit)

  const label = buttonText ?? `Add ${entity}`
  const dialogTitle = title ?? label
  const dialogDescription =
    description ??
    `Create a new ${entity}. Fill out the fields and save to add it to the system.`

  const baseHandleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen)
      }

      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange],
  )

  type FormValues = z.infer<TSchema>

  const form = useForm<FormValues>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: defaultValues as DeepPartial<FormValues> | undefined,
    mode: "onSubmit",
  })

  const resetToDefault = useCallback(
    (values?: DeepPartial<FormValues>) => {
      form.reset(values ?? (defaultValues as DeepPartial<FormValues> | undefined))
    },
    [form, defaultValues],
  )

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      baseHandleOpenChange(nextOpen)

      if (!nextOpen && autoResetOnClose && isConfigured) {
        resetToDefault()
        setSubmitError(null)
      }
    },
    [autoResetOnClose, baseHandleOpenChange, isConfigured, resetToDefault],
  )

  const closeDialog = useCallback(() => handleOpenChange(false), [handleOpenChange])

  const submitHelpers = useMemo<AddRecordSubmitHelpers<FormValues>>(
    () => ({
      close: closeDialog,
      reset: resetToDefault,
      form,
    }),
    [closeDialog, form, resetToDefault],
  )

  const handleValidSubmit = useCallback<SubmitHandler<FormValues>>(
    async (values) => {
      if (!isConfigured || !onSubmit) {
        return
      }

      setSubmitError(null)

      try {
        await onSubmit(values, submitHelpers)
        onSuccess?.(values)

        if (autoCloseOnSuccess) {
          closeDialog()
        } else if (autoResetOnClose) {
          resetToDefault()
        }
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Something went wrong while saving.",
        )
        onError?.(error)
      }
    },
    [
      autoCloseOnSuccess,
      autoResetOnClose,
      closeDialog,
      isConfigured,
      onError,
      onSubmit,
      onSuccess,
      resetToDefault,
      submitHelpers,
    ],
  )

  const isSubmitting = form.formState.isSubmitting && isConfigured

  if (!isConfigured) {
    return (
      <Dialog open={dialogOpen} onOpenChange={baseHandleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" {...buttonProps}>
            <Icon className="size-4" />
            {label}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription className="sr-only">
              {dialogDescription}
            </DialogDescription>
          </DialogHeader>
          {children ?? (
            <div className="text-sm text-muted-foreground">
              Form for new {entity} goes here.
            </div>
          )}
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                {cancelLabel}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="button">{submitLabel}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" {...buttonProps}>
          <Icon className="size-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleValidSubmit)}
            className="space-y-6"
          >
            {renderForm(form)}

            {submitError ? (
              <p role="alert" className="text-sm text-destructive">
                {submitError}
              </p>
            ) : null}

            {renderAfterForm}

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (autoResetOnClose) {
                      resetToDefault()
                    }
                    setSubmitError(null)
                  }}
                >
                  {cancelLabel}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                ) : null}
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
