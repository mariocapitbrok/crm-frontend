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
import { type ZodType } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  DefaultValues,
  FieldValues,
  SubmitHandler,
  UseFormReturn,
  useForm,
  type Resolver,
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
import { ScrollArea } from "@/components/ui/scroll-area"

type AddRecordSubmitHelpers<TValues extends FieldValues> = {
  close: () => void
  reset: (values?: DefaultValues<TValues>) => void
  form: UseFormReturn<TValues>
}

type AddRecordRenderForm<TValues extends FieldValues> = (
  form: UseFormReturn<TValues>,
) => ReactNode

type BaseAddRecordProps<TValues extends FieldValues> = {
  entity: string
  schema?: ZodType<TValues, TValues>
  renderForm?: AddRecordRenderForm<TValues>
  onSubmit?: (
    values: TValues,
    helpers: AddRecordSubmitHelpers<TValues>,
  ) => Promise<void> | void
  defaultValues?: DefaultValues<TValues>
  buttonText?: string
  submitLabel?: string
  cancelLabel?: string
  title?: string
  description?: string
  icon?: ComponentType<{ className?: string }>
  buttonProps?: Omit<ComponentProps<typeof Button>, "children">
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: (values: TValues) => void
  onError?: (error: unknown) => void
  autoCloseOnSuccess?: boolean
  autoResetOnClose?: boolean
  renderAfterForm?: ReactNode
  children?: ReactNode
}

export type AddRecordProps<TValues extends FieldValues = FieldValues> =
  BaseAddRecordProps<TValues>

export default function AddRecord<TValues extends FieldValues = FieldValues>({
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
}: AddRecordProps<TValues>) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isControlled = open !== undefined
  const dialogOpen = isControlled ? open : internalOpen

  const configuration = useMemo(
    () =>
      schema && renderForm && onSubmit
        ? { renderForm, onSubmit }
        : null,
    [onSubmit, renderForm, schema],
  )

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

  const formResolver = useMemo<Resolver<TValues> | undefined>(
    () =>
      schema
        ? (zodResolver(schema) as unknown as Resolver<TValues>)
        : undefined,
    [schema],
  )

  const form = useForm<TValues>({
    resolver: formResolver,
    defaultValues,
    mode: "onSubmit",
  })

  const resetToDefault = useCallback(
    (values?: DefaultValues<TValues>) => {
      if (values) {
        form.reset(values)
        return
      }

      if (defaultValues) {
        form.reset(defaultValues)
        return
      }

      form.reset()
    },
    [form, defaultValues],
  )

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      baseHandleOpenChange(nextOpen)

      if (!nextOpen && autoResetOnClose && configuration) {
        resetToDefault()
        setSubmitError(null)
      }
    },
    [autoResetOnClose, baseHandleOpenChange, configuration, resetToDefault],
  )

  const closeDialog = useCallback(() => handleOpenChange(false), [handleOpenChange])

  const submitHelpers = useMemo<AddRecordSubmitHelpers<TValues>>(
    () => ({
      close: closeDialog,
      reset: resetToDefault,
      form,
    }),
    [closeDialog, form, resetToDefault],
  )

  const handleValidSubmit = useCallback<SubmitHandler<TValues>>(
    async (values) => {
      if (!configuration) {
        return
      }

      setSubmitError(null)

      try {
        await configuration.onSubmit(values, submitHelpers)
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
      onError,
      onSuccess,
      resetToDefault,
      submitHelpers,
      configuration,
    ],
  )

  const isSubmitting = form.formState.isSubmitting && Boolean(configuration)

  if (!configuration) {
    return (
      <Dialog open={dialogOpen} onOpenChange={baseHandleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" {...buttonProps}>
            <Icon className="size-4" />
            {label}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg sm:max-w-xl max-h-[80vh] overflow-hidden">
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
      <DialogContent className="max-w-lg sm:max-w-xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleValidSubmit)}
            className="flex flex-col gap-6"
          >
            <ScrollArea className="max-h-[calc(80vh-10rem)] pr-1">
              <div className="space-y-6 pr-2">
                {configuration.renderForm(form)}

                {submitError ? (
                  <p role="alert" className="text-sm text-destructive">
                    {submitError}
                  </p>
                ) : null}

                {renderAfterForm}
              </div>
            </ScrollArea>

            <DialogFooter className="border-t gap-2 pt-4">
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
