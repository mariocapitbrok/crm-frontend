"use client"

import { useCallback, useMemo, useState, type FC } from "react"
import {
  ConfigureEntityFieldsDialog,
  CreateEntityButton,
  EntityDirectory,
  buildDefaultMenus,
  type EntityColumn,
  type MenuRenderCtx,
  useEntityFields,
  type EntityFieldDefinition as UiEntityFieldDefinition,
} from "@/domains/entities/ui"
import { FileSpreadsheet, Settings2 } from "lucide-react"
import {
  useCreateLeadEntry,
  useLeadDirectory,
  useLeadOwners,
  type LeadRecord,
} from "../application/queries"
import {
  coreLeadFieldDefinitions,
  createDefaultLeadValues,
  type LeadFieldDefinition,
  type LeadFormValues,
} from "../domain/leadSchemas"
import { useLeadsUiStore } from "./store"
import ImportRecords from "@/domains/entities/ui/EntityDirectory/ImportRecords"
import { MenubarItem, MenubarLabel } from "@/components/ui/menubar"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DefaultValues, UseFormReturn } from "react-hook-form"

type LeadRow = {
  id: number
  [key: string]: unknown
}

type Option = { value: number; label: string }

type LeadFieldInputsProps = {
  form: UseFormReturn<LeadFormValues>
  definitions: LeadFieldDefinition[]
  ownerOptions: Option[]
  ownersLoading?: boolean
}

function LeadFieldInputs({
  form,
  definitions,
  ownerOptions,
  ownersLoading,
}: LeadFieldInputsProps) {
  return (
    <div className="grid gap-4">
      {definitions.map((definition) => (
        <LeadFieldInput
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

type LeadFieldInputProps = {
  form: UseFormReturn<LeadFormValues>
  definition: LeadFieldDefinition
  ownerOptions: Option[]
  ownersLoading?: boolean
}

function LeadFieldInput({
  form,
  definition,
  ownerOptions,
  ownersLoading,
}: LeadFieldInputProps) {
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

  const typeAttr =
    definition.dataType === "email"
      ? "email"
      : definition.dataType === "number"
        ? "number"
        : "text"

  return (
    <FormField<LeadFormValues>
      control={form.control}
      name={definition.id}
      render={({ field }) => {
        const rawValue = field.value
        const inputValue =
          typeof rawValue === "string"
            ? rawValue
            : typeof rawValue === "number"
              ? String(rawValue)
              : ""

        return (
          <FormItem>
            <FormLabel>{definition.label}</FormLabel>
            <FormControl>
              <Input
                type={typeAttr}
                placeholder={definition.placeholder}
                autoComplete={definition.autoComplete}
                value={inputValue}
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

const leadIcon = <FileSpreadsheet className="size-7" />
function buildLeadMenus(
  onOpenConfigureFields: () => void,
  disableConfigureItem: boolean,
) {
  const baseMenus = buildDefaultMenus(useLeadsUiStore)
  return baseMenus.map((menu) => {
    if (menu.id !== "edit") return menu

    const EditMenuContent: FC<MenuRenderCtx> = () => (
      <div className="w-56 p-1">
        <MenubarLabel>Edit</MenubarLabel>
        <MenubarItem
          className="flex items-center gap-2"
          disabled={disableConfigureItem}
          onSelect={onOpenConfigureFields}
        >
          <Settings2 className="size-4" aria-hidden />
          Configure entity fields…
        </MenubarItem>
      </div>
    )

    return {
      ...menu,
      content: EditMenuContent,
    }
  })
}

const leadEntity = {
  key: "leads" as const,
  title: "Leads",
  singular: "Lead",
  icon: leadIcon,
  uiStore: useLeadsUiStore,
}

export default function LeadsDirectoryPage() {
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false)
  const handleOpenConfigureDialog = useCallback(() => {
    setConfigureDialogOpen(true)
  }, [])
  const leadMenus = useMemo(
    () => buildLeadMenus(handleOpenConfigureDialog, configureDialogOpen),
    [handleOpenConfigureDialog, configureDialogOpen],
  )

  const { data: leads, isLoading: leadsLoading, error: leadsError } = useLeadDirectory()
  const { data: users, isLoading: usersLoading, error: usersError } = useLeadOwners()
  const createLead = useCreateLeadEntry()
  const { data: fieldDefinitions } = useEntityFields("leads")

  const definitions = useMemo<LeadFieldDefinition[]>(() => {
    if (!fieldDefinitions) {
      return coreLeadFieldDefinitions
    }
    return fieldDefinitions.map((field: UiEntityFieldDefinition) => ({
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
  }, [fieldDefinitions])

  const ownerOptions = useMemo<Option[]>(() => {
    return (users ?? []).map((owner) => ({
      value: owner.id,
      label: `${owner.first_name} ${owner.last_name}`,
    }))
  }, [users])

  const userMap = useMemo(() => {
    const map = new Map<number, string>()
    ;(users ?? []).forEach((u) =>
      map.set(u.id, `${u.first_name} ${u.last_name}`),
    )
    return map
  }, [users])

  const rows: LeadRow[] = useMemo(() => {
    return (leads ?? []).map((lead: LeadRecord) => {
      const row: LeadRow = { id: lead.id }
      definitions.forEach((def) => {
        if (def.dataType === "user") {
          const ownerId = lead[def.id] as number | undefined
          row[def.id] = ownerId ? userMap.get(ownerId) ?? "" : ""
          return
        }
        const value = lead[def.id]
        row[def.id] = value ?? ""
      })
      return row
    })
  }, [definitions, leads, userMap])

  const columns: EntityColumn<LeadRow>[] = useMemo(() => {
    return definitions.map((definition) => {
      const basePlaceholder = definition.label
      const width = definition.dataType === "text" ? 200 : 220

      const column: EntityColumn<LeadRow> = {
        id: definition.id,
        header: definition.label,
        accessor: (row) => {
          const value = row[definition.id]
          if (definition.dataType === "email" && typeof value === "string" && value) {
            return (
              <a className="hover:underline" href={`mailto:${value}`}>
                {value}
              </a>
            )
          }
          if (typeof value === "string" || typeof value === "number") {
            return value
          }
          return value == null ? "" : String(value)
        },
        sortAccessor: (row) => {
          const value = row[definition.id]
          if (typeof value === "number") return value
          return typeof value === "string" ? value : ""
        },
        filter: { type: "text", placeholder: basePlaceholder },
        width,
      }

      return column
    })
  }, [definitions])

  return (
    <>
      <ConfigureEntityFieldsDialog
        entityKey="leads"
        entityLabel="Lead"
        baseDefinitions={coreLeadFieldDefinitions}
        open={configureDialogOpen}
        onOpenChange={setConfigureDialogOpen}
      />
      <EntityDirectory
        entity={{
          ...leadEntity,
          menus: leadMenus,
        }}
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={leadsLoading || usersLoading}
        loadingMessage="Loading leads…"
        error={leadsError || usersError}
        navActions={
          <>
            <CreateEntityButton<LeadFormValues>
              entityKey="leads"
              entityLabel="Lead"
              baseDefinitions={coreLeadFieldDefinitions}
              submitLabel="Create lead"
              mutation={async (values) => {
                await createLead.mutateAsync(values)
              }}
              defaultValuesTransform={(_, definitions) =>
                createDefaultLeadValues(
                  definitions as LeadFieldDefinition[],
                ) as DefaultValues<LeadFormValues>
              }
              renderForm={({ form, definitions }) => (
                <LeadFieldInputs
                  form={form as UseFormReturn<LeadFormValues>}
                  definitions={definitions as LeadFieldDefinition[]}
                  ownerOptions={ownerOptions}
                  ownersLoading={usersLoading}
                />
              )}
              buttonProps={{ className: "text-[13px]" }}
            />
            <ImportRecords
              entity={leadEntity.title}
              buttonText="Import"
              buttonProps={{ className: "text-[13px]" }}
            />
          </>
        }
      />
    </>
  )
}
