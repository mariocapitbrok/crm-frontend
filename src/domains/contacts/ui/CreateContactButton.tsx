"use client"

import { useMemo } from "react"
import AddRecord from "@/domains/entities/ui/EntityDirectory/AddRecord"
import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormDescription,
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
import { contactCreateSchema, type ContactCreateInput } from "../domain/contactSchemas"
import {
  useCreateContactEntry,
  type ContactRecord,
} from "../application/queries"
import type { OrganizationRecord } from "@/domains/organizations/application/queries"
import type { IdentityUser } from "@/domains/identity/application/users"
import type { DefaultValues } from "react-hook-form"

type CreateContactButtonProps = {
  accounts?: OrganizationRecord[] | null
  owners?: IdentityUser[] | null
  accountsLoading?: boolean
  ownersLoading?: boolean
}

const defaultValues: DefaultValues<ContactCreateInput> = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  title: "",
  account_id: undefined,
  assigned_user_id: undefined,
}

const NO_ACCOUNT_VALUE = "__no_account"
const UNASSIGNED_OWNER_VALUE = "__unassigned"

export default function CreateContactButton({
  accounts,
  owners,
  accountsLoading,
  ownersLoading,
}: CreateContactButtonProps) {
  const mutation = useCreateContactEntry()

  const accountOptions = useMemo(() => {
    return (accounts ?? []).map((account) => ({
      value: account.id,
      label: account.accountname,
    }))
  }, [accounts])

  const ownerOptions = useMemo(() => {
    return (owners ?? []).map((owner) => ({
      value: owner.id,
      label: `${owner.first_name} ${owner.last_name}`,
    }))
  }, [owners])

  return (
    <AddRecord<ContactCreateInput>
      entity="Contact"
      schema={contactCreateSchema}
      defaultValues={defaultValues}
      submitLabel="Create contact"
      buttonProps={{ className: "text-[13px]" }}
      renderForm={(form) => (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jamie" autoComplete="given-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" autoComplete="family-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="VP of Operations" autoComplete="organization-title" {...field} />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="jamie@acme.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="(555) 555-1234"
                    autoComplete="tel"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select
                    disabled={accountsLoading}
                    value={
                      field.value !== undefined
                        ? String(field.value)
                        : NO_ACCOUNT_VALUE
                    }
                    onValueChange={(value) => {
                      field.onChange(
                        value === NO_ACCOUNT_VALUE ? undefined : Number(value),
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
                      {accountOptions.map((account) => (
                        <SelectItem key={account.value} value={String(account.value)}>
                          {account.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigned_user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner</FormLabel>
                  <Select
                    disabled={ownersLoading}
                    value={
                      field.value !== undefined
                        ? String(field.value)
                        : UNASSIGNED_OWNER_VALUE
                    }
                    onValueChange={(value) => {
                      field.onChange(
                        value === UNASSIGNED_OWNER_VALUE
                          ? undefined
                          : Number(value),
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
                      {ownerOptions.map((owner) => (
                        <SelectItem key={owner.value} value={String(owner.value)}>
                          {owner.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
      onSubmit={async (values) => {
        const payload: Partial<ContactRecord> = {
          ...values,
          phone: values.phone?.trim() ? values.phone.trim() : undefined,
          title: values.title?.trim() ? values.title.trim() : undefined,
        }

        await mutation.mutateAsync(payload)
      }}
    />
  )
}
