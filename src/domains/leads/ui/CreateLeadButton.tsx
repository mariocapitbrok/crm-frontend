"use client"

import { useMemo } from "react"
import type { UseFormReturn } from "react-hook-form"
import { Loader2 } from "lucide-react"
import AddRecord from "@/domains/entities/ui/EntityDirectory/AddRecord"
import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useEntityFieldConfig,
  useEntityFields,
  type EntityFieldDefinition,
} from "@/domains/entities/ui"
import {
  useCreateLeadEntry,
  type LeadOwner,
} from "../application/queries"
import {
  buildLeadFormSchema,
  coreLeadFieldDefinitions,
  createDefaultLeadValues,
  getDefaultRequiredLeadFieldIds,
  resolveLeadRequiredFields,
  type LeadFieldDefinition,
  type LeadFormValues,
} from "../domain/leadSchemas"

const entityKey = "leads" as const

type CreateLeadButtonProps = {
  owners?: LeadOwner[] | null
  ownersLoading?: boolean
}

type LeadFieldProps = {
  form: UseFormReturn<LeadFormValues>
  definition: LeadFieldDefinition
  ownerOptions: { value: number; label: string }[]
  ownersLoading?: boolean
}

function LeadField({
  form,
  definition,
  ownerOptions,
  ownersLoading,
}: LeadFieldProps) {
  if (definition.dataType === "user") {
    return (
      <FormField
        control={form.control}
        name={definition.id}
        render={({ field }) => {
          const value =
            field.value !== undefined && field.value !== null
              ? String(field.value)
              : undefined
          return (
            <FormItem>
              <FormLabel>{definition.label}</FormLabel>
              <Select
                disabled={ownersLoading}
                value={value}
                onValueChange={(next) => {
                  field.onChange(next ? Number(next) : undefined)
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        ownersLoading ? "Loading owners…" : "Select owner"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ownerOptions.map((owner) => (
                    <SelectItem key={owner.value} value={String(owner.value)}>
                      {owner.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )
        }}
      />
    )
  }

  return (
    <FormField
      control={form.control}
      name={definition.id}
      render={({ field }) => {
        const value =
          field.value === undefined || field.value === null
            ? ""
            : String(field.value)
        const typeAttr =
          definition.dataType === "email"
            ? "email"
            : definition.dataType === "number"
              ? "number"
              : "text"
        return (
          <FormItem>
            <FormLabel>{definition.label}</FormLabel>
            <FormControl>
              <Input
                type={typeAttr}
                placeholder={definition.placeholder}
                autoComplete={definition.autoComplete}
                value={value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

function LeadFormFields({
  form,
  definitions,
  ownerOptions,
  ownersLoading,
}: {
  form: UseFormReturn<LeadFormValues>
  definitions: LeadFieldDefinition[]
  ownerOptions: { value: number; label: string }[]
  ownersLoading?: boolean
}) {
  return (
    <div className="grid gap-4">
      {definitions.map((definition) => (
        <LeadField
          key={definition.id}
          form={form}
          definition={definition}
          ownerOptions={ownerOptions}
          ownersLoading={ownersLoading}
        />
      ))}
    </div>
  )
}

export default function CreateLeadButton({
  owners,
  ownersLoading,
}: CreateLeadButtonProps) {
  const mutation = useCreateLeadEntry()
  const ownerOptions = useMemo(() => {
    return (owners ?? []).map((owner) => ({
      value: owner.id,
      label: `${owner.first_name} ${owner.last_name}`,
    }))
  }, [owners])

  const {
    data: fetchedDefinitions,
    isFetching: definitionsFetching,
  } = useEntityFields(entityKey)

  const allDefinitions = useMemo<LeadFieldDefinition[]>(() => {
    if (!fetchedDefinitions) {
      return coreLeadFieldDefinitions
    }
    return fetchedDefinitions.map((field: EntityFieldDefinition) => ({
      id: field.id,
      label: field.label,
      description: field.description,
      placeholder: field.placeholder,
      dataType: field.dataType,
      autoComplete: field.autoComplete,
      kind: field.kind,
      defaultRequired:
        field.defaultRequired ?? (field.kind === "core" && field.requiredBySystem),
    }))
  }, [fetchedDefinitions])
  const defaultRequired = useMemo(
    () => getDefaultRequiredLeadFieldIds(allDefinitions),
    [allDefinitions],
  )

  const { data: fieldConfig, isFetching: configFetching } =
    useEntityFieldConfig(entityKey, {
      requiredFieldIds: defaultRequired,
    })

  const requiredFieldIds = useMemo(() => {
    return resolveLeadRequiredFields(fieldConfig?.requiredFieldIds, allDefinitions)
  }, [fieldConfig?.requiredFieldIds, allDefinitions])

  const requiredDefinitions = useMemo(() => {
    const byId = new Map(allDefinitions.map((def) => [def.id, def]))
    return requiredFieldIds
      .map((id) => byId.get(id))
      .filter((def): def is LeadFieldDefinition => Boolean(def))
  }, [allDefinitions, requiredFieldIds])

  const formSchema = useMemo(
    () => buildLeadFormSchema(allDefinitions, requiredFieldIds),
    [allDefinitions, requiredFieldIds],
  )

  const defaultValues = useMemo(
    () => createDefaultLeadValues(allDefinitions),
    [allDefinitions],
  )

  const settingsLoading = definitionsFetching || configFetching

  return (
    <AddRecord<LeadFormValues>
      entity="Lead"
      schema={formSchema}
      defaultValues={defaultValues}
      submitLabel="Create lead"
      buttonProps={{ className: "text-[13px]" }}
      renderForm={(form) => (
        <LeadFormFields
          form={form}
          definitions={requiredDefinitions}
          ownerOptions={ownerOptions}
          ownersLoading={ownersLoading}
        />
      )}
      renderAfterForm={
        settingsLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" aria-hidden />
            Loading form settings…
          </div>
        ) : null
      }
      onSubmit={async (values) => {
        await mutation.mutateAsync(values)
      }}
    />
  )
}
