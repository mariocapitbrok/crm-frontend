"use client"

import { useMemo } from "react"
import type { DefaultValues, UseFormReturn } from "react-hook-form"
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
import { useEntityFieldConfig } from "@/domains/entities/ui"
import {
  useCreateLeadEntry,
  type LeadOwner,
} from "../application/queries"
import {
  buildLeadFormSchema,
  defaultRequiredLeadFieldIds,
  leadFieldDefinitionMap,
  leadFieldDefinitions,
  resolveLeadRequiredFields,
  type LeadFieldDefinition,
  type LeadFieldId,
  type LeadFormValues,
} from "../domain/leadSchemas"

const defaultValues: DefaultValues<LeadFormValues> = {
  firstname: "",
  lastname: "",
  email: "",
  company: "",
  assigned_user_id: undefined,
}

const entityKey = "leads" as const
const orderedFieldIds = leadFieldDefinitions.map((field) => field.id)

function normalizeOrder(ids: LeadFieldId[]): LeadFieldId[] {
  return orderedFieldIds.filter((id) => ids.includes(id))
}

type CreateLeadButtonProps = {
  owners?: LeadOwner[] | null
  ownersLoading?: boolean
}

type LeadFormFieldsProps = {
  form: UseFormReturn<LeadFormValues>
  fieldIds: LeadFieldId[]
  ownerOptions: { value: number; label: string }[]
  ownersLoading?: boolean
}

function LeadFormFields({
  form,
  fieldIds,
  ownerOptions,
  ownersLoading,
}: LeadFormFieldsProps) {
  return (
    <div className="grid gap-4">
      {fieldIds.map((fieldId) => (
        <LeadField
          key={fieldId}
          form={form}
          fieldId={fieldId}
          ownerOptions={ownerOptions}
          ownersLoading={ownersLoading}
        />
      ))}
    </div>
  )
}

type LeadFieldProps = {
  form: UseFormReturn<LeadFormValues>
  fieldId: LeadFieldId
  ownerOptions: { value: number; label: string }[]
  ownersLoading?: boolean
}

type LeadTextFieldId = Exclude<LeadFieldId, "assigned_user_id">

function LeadTextField({
  form,
  fieldId,
  definition,
}: {
  form: UseFormReturn<LeadFormValues>
  fieldId: LeadTextFieldId
  definition: LeadFieldDefinition
}) {
  return (
    <FormField<LeadFormValues, LeadTextFieldId>
      control={form.control}
      name={fieldId}
      render={({ field }) => {
        const textValue = typeof field.value === "string" ? field.value : ""
        return (
          <FormItem>
            <FormLabel>{definition.label}</FormLabel>
            <FormControl>
              <Input
                type={definition.inputType === "email" ? "email" : "text"}
                placeholder={definition.placeholder}
                autoComplete={definition.autoComplete}
                value={textValue}
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

function LeadAssignedOwnerField({
  form,
  definition,
  ownerOptions,
  ownersLoading,
}: {
  form: UseFormReturn<LeadFormValues>
  definition: LeadFieldDefinition
  ownerOptions: { value: number; label: string }[]
  ownersLoading?: boolean
}) {
  return (
    <FormField
      control={form.control}
      name="assigned_user_id"
      render={({ field }) => {
        const value = field.value !== undefined ? String(field.value) : undefined
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

function LeadField({
  form,
  fieldId,
  ownerOptions,
  ownersLoading,
}: LeadFieldProps) {
  const definition = leadFieldDefinitionMap[fieldId]

  if (fieldId === "assigned_user_id") {
    return (
      <LeadAssignedOwnerField
        form={form}
        definition={definition}
        ownerOptions={ownerOptions}
        ownersLoading={ownersLoading}
      />
    )
  }

  return (
    <LeadTextField
      form={form}
      fieldId={fieldId as LeadTextFieldId}
      definition={definition}
    />
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

  const { data: fieldConfig, isFetching: configFetching } =
    useEntityFieldConfig(entityKey, {
      requiredFieldIds: defaultRequiredLeadFieldIds,
    })

  const requiredFieldIds = useMemo(() => {
    return normalizeOrder(
      resolveLeadRequiredFields(fieldConfig?.requiredFieldIds ?? null),
    )
  }, [fieldConfig?.requiredFieldIds])

  const schema = useMemo(
    () => buildLeadFormSchema(requiredFieldIds),
    [requiredFieldIds],
  )

  return (
    <AddRecord<LeadFormValues>
      entity="Lead"
      schema={schema}
      defaultValues={defaultValues}
      submitLabel="Create lead"
      buttonProps={{ className: "text-[13px]" }}
      renderForm={(form) => (
        <LeadFormFields
          form={form}
          fieldIds={requiredFieldIds}
          ownerOptions={ownerOptions}
          ownersLoading={ownersLoading}
        />
      )}
      renderAfterForm={
        configFetching ? (
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
