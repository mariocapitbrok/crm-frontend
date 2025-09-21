"use client"

import { useMemo, type ComponentProps, type ReactNode } from "react"
import { Loader2 } from "lucide-react"
import {
  type FieldValues,
  type DefaultValues,
  type UseFormReturn,
} from "react-hook-form"
import AddRecord from "@/domains/entities/ui/EntityDirectory/AddRecord"
import {
  buildEntityFormSchema,
  createDefaultEntityValues,
  getDefaultRequiredFieldIds,
  getDefaultVisibleFieldIds,
  resolveRequiredFields,
  resolveVisibleFields,
  type EntityFieldDefinition,
} from "@/domains/entities/domain/entityFieldSchemas"
import {
  useEntityFieldConfig,
  useEntityFields,
  type EntityFieldDefinition as UiEntityFieldDefinition,
} from "@/domains/entities/ui"
import type { EntityKey } from "@/domains/entityKeys"
import type { ZodType } from "zod"

type SubmitTransform<TValues> = (values: TValues) => Promise<TValues> | TValues

type RenderFormArgs<TValues extends FieldValues> = {
  form: UseFormReturn<TValues>
  definitions: EntityFieldDefinition[]
}

type CreateEntityButtonProps<TValues extends FieldValues> = {
  entityKey: EntityKey
  entityLabel: string
  baseDefinitions: EntityFieldDefinition[]
  mutation: (values: TValues) => Promise<void>
  renderForm: (args: RenderFormArgs<TValues>) => ReactNode
  submitLabel?: string
  buttonProps?: ComponentProps<typeof AddRecord<TValues>>["buttonProps"]
  renderAfterForm?: ReactNode
  defaultValuesTransform?: (
    values: Record<string, unknown>,
    definitions: EntityFieldDefinition[],
  ) => DefaultValues<TValues>
  submitTransform?: SubmitTransform<TValues>
}

export default function CreateEntityButton<TValues extends FieldValues>({
  entityKey,
  entityLabel,
  baseDefinitions,
  mutation,
  renderForm,
  submitLabel,
  buttonProps,
  renderAfterForm,
  defaultValuesTransform,
  submitTransform,
}: CreateEntityButtonProps<TValues>) {
  const { data: fetchedDefinitions, isFetching: definitionsFetching } =
    useEntityFields(entityKey)

  const definitions = useMemo<EntityFieldDefinition[]>(() => {
    if (!fetchedDefinitions) {
      return baseDefinitions
    }
    return fetchedDefinitions.map((field: UiEntityFieldDefinition) => ({
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
  }, [baseDefinitions, fetchedDefinitions])

  const defaultRequired = useMemo(
    () => getDefaultRequiredFieldIds(definitions),
    [definitions],
  )
  const defaultVisible = useMemo(
    () => getDefaultVisibleFieldIds(definitions),
    [definitions],
  )

  const { data: fieldConfig, isFetching: configFetching } = useEntityFieldConfig(
    entityKey,
    { requiredFieldIds: defaultRequired, visibleFieldIds: defaultVisible },
  )

  const requiredFieldIds = useMemo(() => {
    return resolveRequiredFields(fieldConfig?.requiredFieldIds, definitions)
  }, [fieldConfig?.requiredFieldIds, definitions])

  const visibleFieldIds = useMemo(() => {
    return resolveVisibleFields(fieldConfig?.visibleFieldIds, definitions)
  }, [fieldConfig?.visibleFieldIds, definitions])

  const visibleDefinitions = useMemo(() => {
    const byId = new Map(definitions.map((def) => [def.id, def]))
    return visibleFieldIds
      .map((id) => byId.get(id))
      .filter((def): def is EntityFieldDefinition => Boolean(def))
  }, [definitions, visibleFieldIds])

  const formSchema = useMemo<ZodType<TValues, TValues>>(() => {
    return buildEntityFormSchema(definitions, requiredFieldIds) as unknown as ZodType<TValues, TValues>
  }, [definitions, requiredFieldIds])

  const defaultValues = useMemo<DefaultValues<TValues>>(() => {
    const rawValues = createDefaultEntityValues(definitions)
    return (defaultValuesTransform
      ? defaultValuesTransform(rawValues, definitions)
      : (rawValues as DefaultValues<TValues>))
  }, [defaultValuesTransform, definitions])

  const settingsLoading = definitionsFetching || configFetching

  const handleSubmit = async (values: TValues) => {
    const transformed = submitTransform
      ? await submitTransform(values)
      : values
    await mutation(transformed)
  }

  return (
    <AddRecord<TValues>
      entity={entityLabel}
      schema={formSchema}
      defaultValues={defaultValues}
      submitLabel={submitLabel ?? `Create ${entityLabel.toLowerCase()}`}
      buttonProps={buttonProps}
      renderForm={(form) =>
        renderForm({ form, definitions: visibleDefinitions })
      }
      renderAfterForm={
        renderAfterForm ??
        (settingsLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" aria-hidden />
            Loading form settings…
          </div>
        ) : null)
      }
      onSubmit={handleSubmit}
    />
  )
}
