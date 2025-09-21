"use client"

import { useCallback, useMemo, useState, type FC } from "react"
import {
  ConfigureEntityFieldsDialog,
  CreateEntityButton,
  EntityDirectory,
  buildDefaultMenus,
  type EntityColumn,
  type MenuRenderCtx,
} from "@/domains/entities/ui"
import { MenubarItem, MenubarLabel } from "@/components/ui/menubar"
import { FileSpreadsheet, Settings2 } from "lucide-react"
import {
  useContactDirectory,
  useCreateContactEntry,
  type ContactRecord,
} from "../application/queries"
import { useOrganizationDirectory } from "@/domains/organizations/application/queries"
import { useIdentityUsers } from "@/domains/identity/application/users"
import { useContactsUiStore } from "./store"
import ImportRecords from "@/domains/entities/ui/EntityDirectory/ImportRecords"
import {
  coreContactFieldDefinitions,
  createDefaultContactValues,
  type ContactFieldDefinition,
  type ContactFormValues,
} from "../domain/contactFieldSchemas"
import {
  FormControl,
  FormDescription,
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

type ContactRow = {
  id: number
  firstname: string
  lastname: string
  title?: string
  email: string
  phone?: string
  account?: string
  assignedTo?: string
}

type Option = { value: number; label: string }

const NO_ACCOUNT_VALUE = "__no_account"
const UNASSIGNED_OWNER_VALUE = "__unassigned"

type ContactFieldInputsProps = {
  form: UseFormReturn<ContactFormValues>
  definitions: ContactFieldDefinition[]
  accountOptions: Option[]
  ownerOptions: Option[]
  accountsLoading?: boolean
  ownersLoading?: boolean
}

function ContactFieldInputs({
  form,
  definitions,
  accountOptions,
  ownerOptions,
  accountsLoading,
  ownersLoading,
}: ContactFieldInputsProps) {
  return (
    <div className="grid gap-4">
      {definitions.map((definition) => (
        <ContactFieldInput
          key={definition.id}
          form={form}
          definition={definition}
          accountOptions={accountOptions}
          ownerOptions={ownerOptions}
          accountsLoading={accountsLoading}
          ownersLoading={ownersLoading}
        />
      ))}
    </div>
  )
}

type ContactFieldInputProps = {
  form: UseFormReturn<ContactFormValues>
  definition: ContactFieldDefinition
  accountOptions: Option[]
  ownerOptions: Option[]
  accountsLoading?: boolean
  ownersLoading?: boolean
}

function ContactFieldInput({
  form,
  definition,
  accountOptions,
  ownerOptions,
  accountsLoading,
  ownersLoading,
}: ContactFieldInputProps) {
  if (definition.id === "account_id") {
    return (
      <FormField
        control={form.control}
        name={definition.id}
        render={({ field }) => {
          const value =
            field.value !== undefined && field.value !== null
              ? String(field.value)
              : NO_ACCOUNT_VALUE
          const description =
            definition.description ??
            (definition.defaultRequired ? undefined : "Optional")
          return (
            <FormItem>
              <FormLabel>{definition.label}</FormLabel>
              <Select
                disabled={accountsLoading}
                value={value}
                onValueChange={(next) => {
                  field.onChange(
                    next === NO_ACCOUNT_VALUE ? undefined : Number(next),
                  )
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        accountsLoading ? "Loading accounts…" : "No account"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NO_ACCOUNT_VALUE}>No account</SelectItem>
                  {accountOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={String(option.value)}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {description ? <FormDescription>{description}</FormDescription> : null}
              <FormMessage />
            </FormItem>
          )
        }}
      />
    )
  }

  if (definition.dataType === "user") {
    return (
      <FormField
        control={form.control}
        name={definition.id}
        render={({ field }) => {
          const value =
            field.value !== undefined && field.value !== null
              ? String(field.value)
              : UNASSIGNED_OWNER_VALUE
          const description =
            definition.description ??
            (definition.defaultRequired ? undefined : "Optional")
          return (
            <FormItem>
              <FormLabel>{definition.label}</FormLabel>
              <Select
                disabled={ownersLoading}
                value={value}
                onValueChange={(next) => {
                  field.onChange(
                    next === UNASSIGNED_OWNER_VALUE ? undefined : Number(next),
                  )
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        ownersLoading ? "Loading owners…" : "Unassigned"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UNASSIGNED_OWNER_VALUE}>
                    Unassigned
                  </SelectItem>
                  {ownerOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={String(option.value)}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {description ? <FormDescription>{description}</FormDescription> : null}
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
  const description =
    definition.description ??
    (definition.defaultRequired ? undefined : "Optional")

  return (
    <FormField<ContactFormValues>
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
            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

const contactIcon = <FileSpreadsheet className="size-7" />

function buildContactMenus(onOpenConfigureFields: () => void, disabled: boolean) {
  const baseMenus = buildDefaultMenus(useContactsUiStore)
  return baseMenus.map((menu) => {
    if (menu.id !== "edit") return menu

    const EditMenuContent: FC<MenuRenderCtx> = () => (
      <div className="w-56 p-1">
        <ConfigureMenuContent
          onOpenConfigureFields={onOpenConfigureFields}
          disabled={disabled}
        />
      </div>
    )

    return {
      ...menu,
      content: EditMenuContent,
    }
  })
}

function ConfigureMenuContent({
  onOpenConfigureFields,
  disabled,
}: {
  onOpenConfigureFields: () => void
  disabled: boolean
}) {
  return (
    <>
      <MenubarLabel>Edit</MenubarLabel>
      <MenubarItem
        className="flex items-center gap-2"
        disabled={disabled}
        onSelect={onOpenConfigureFields}
      >
        <Settings2 className="size-4" aria-hidden />
        Configure entity fields…
      </MenubarItem>
    </>
  )
}

const contactEntity = {
  key: "contacts" as const,
  title: "Contacts",
  singular: "Contact",
  icon: contactIcon,
  uiStore: useContactsUiStore,
}

export default function ContactsDirectoryPage() {
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false)
  const handleOpenConfigureDialog = useCallback(() => {
    setConfigureDialogOpen(true)
  }, [])
  const contactMenus = useMemo(
    () => buildContactMenus(handleOpenConfigureDialog, configureDialogOpen),
    [handleOpenConfigureDialog, configureDialogOpen],
  )

  const { data: contacts, isLoading: contactsLoading, error: contactsError } =
    useContactDirectory()
  const { data: orgs, isLoading: orgsLoading, error: orgsError } =
    useOrganizationDirectory()
  const { data: users, isLoading: usersLoading, error: usersError } =
    useIdentityUsers()
  const createContact = useCreateContactEntry()

  const orgMap = useMemo(() => {
    const map = new Map<number, string>()
    ;(orgs ?? []).forEach((o) => map.set(o.id, o.accountname))
    return map
  }, [orgs])

  const accountOptions = useMemo<Option[]>(() => {
    return (orgs ?? []).map((account) => ({
      value: account.id,
      label: account.accountname,
    }))
  }, [orgs])

  const ownerOptions = useMemo<Option[]>(() => {
    return (users ?? []).map((owner) => ({
      value: owner.id,
      label: `${owner.first_name} ${owner.last_name}`,
    }))
  }, [users])

  const userMap = useMemo(() => {
    const map = new Map<number, string>()
    ;(users ?? []).forEach((u) => map.set(u.id, `${u.first_name} ${u.last_name}`))
    return map
  }, [users])

  const rows: ContactRow[] = useMemo(() => {
    return (contacts ?? []).map((contact: ContactRecord) => ({
      id: contact.id,
      firstname: contact.firstname,
      lastname: contact.lastname,
      title: contact.title,
      email: contact.email,
      phone: contact.phone,
      account: contact.account_id ? orgMap.get(contact.account_id) : undefined,
      assignedTo: contact.assigned_user_id
        ? userMap.get(contact.assigned_user_id)
        : undefined,
    }))
  }, [contacts, orgMap, userMap])

  const columns: EntityColumn<ContactRow>[] = useMemo(
    () => [
      {
        id: "firstname",
        header: "First Name",
        accessor: (r) => r.firstname,
        sortAccessor: (r) => r.firstname,
        filter: { type: "text", placeholder: "First name" },
        width: 180,
      },
      {
        id: "lastname",
        header: "Last Name",
        accessor: (r) => r.lastname,
        sortAccessor: (r) => r.lastname,
        filter: { type: "text", placeholder: "Last name" },
        width: 180,
      },
      {
        id: "title",
        header: "Title",
        accessor: (r) => r.title ?? "",
        sortAccessor: (r) => r.title ?? "",
        filter: { type: "text", placeholder: "Title" },
        width: 240,
      },
      {
        id: "email",
        header: "Email",
        accessor: (r) => (
          <a className="hover:underline" href={`mailto:${r.email}`}>
            {r.email}
          </a>
        ),
        sortAccessor: (r) => r.email,
        filter: { type: "text", placeholder: "Email" },
        width: 260,
      },
      {
        id: "phone",
        header: "Phone",
        accessor: (r) => r.phone ?? "",
        sortAccessor: (r) => r.phone ?? "",
        filter: { type: "text", placeholder: "Phone" },
        width: 180,
      },
      {
        id: "account",
        header: "Account",
        accessor: (r) => r.account ?? "",
        sortAccessor: (r) => r.account ?? "",
        filter: { type: "text", placeholder: "Account" },
        width: 240,
      },
      {
        id: "assignedTo",
        header: "Assigned To",
        accessor: (r) => r.assignedTo ?? "",
        sortAccessor: (r) => r.assignedTo ?? "",
        filter: { type: "text", placeholder: "Owner" },
        width: 220,
      },
    ],
    [],
  )

  return (
    <>
      <ConfigureEntityFieldsDialog
        entityKey="contacts"
        entityLabel="Contact"
        baseDefinitions={coreContactFieldDefinitions}
        open={configureDialogOpen}
        onOpenChange={setConfigureDialogOpen}
      />
      <EntityDirectory
        entity={{
          ...contactEntity,
          menus: contactMenus,
        }}
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={contactsLoading || usersLoading || orgsLoading}
        loadingMessage="Loading contacts…"
        error={contactsError || usersError || orgsError}
        navActions={
          <>
            <CreateEntityButton<ContactFormValues>
              entityKey="contacts"
              entityLabel="Contact"
              baseDefinitions={coreContactFieldDefinitions}
              submitLabel="Create contact"
              mutation={async (values) => {
                await createContact.mutateAsync(values as Partial<ContactRecord>)
              }}
              defaultValuesTransform={(_, definitions) =>
                createDefaultContactValues(
                  definitions as ContactFieldDefinition[],
                ) as DefaultValues<ContactFormValues>
              }
              renderForm={({ form, definitions }) => (
                <ContactFieldInputs
                  form={form as UseFormReturn<ContactFormValues>}
                  definitions={definitions as ContactFieldDefinition[]}
                  accountOptions={accountOptions}
                  ownerOptions={ownerOptions}
                  accountsLoading={orgsLoading}
                  ownersLoading={usersLoading}
                />
              )}
              submitTransform={async (values) => ({
                ...values,
                phone:
                  typeof values.phone === "string"
                    ? values.phone.trim() === ""
                      ? undefined
                      : values.phone.trim()
                    : values.phone,
              })}
              buttonProps={{ className: "text-[13px]" }}
            />
            <ImportRecords
              entity={contactEntity.title}
              buttonText="Import"
              buttonProps={{ className: "text-[13px]" }}
            />
          </>
        }
      />
    </>
  )
}
