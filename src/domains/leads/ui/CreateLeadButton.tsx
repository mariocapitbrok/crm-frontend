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
import {
  useCreateLeadEntry,
  type LeadOwner,
} from "../application/queries"
import { leadCreateSchema, type LeadCreateInput } from "../domain/leadSchemas"

type CreateLeadButtonProps = {
  owners?: LeadOwner[] | null
  ownersLoading?: boolean
}

const defaultValues: Partial<LeadCreateInput> = {
  firstname: "",
  lastname: "",
  email: "",
  company: "",
  assigned_user_id: undefined,
}

const UNASSIGNED_VALUE = "__unassigned"

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

  return (
    <AddRecord
      entity="Lead"
      schema={leadCreateSchema}
      defaultValues={defaultValues}
      submitLabel="Create lead"
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
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc." autoComplete="organization" {...field} />
                </FormControl>
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
            name="assigned_user_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Owner</FormLabel>
                <Select
                  disabled={ownersLoading}
                  value={
                    field.value !== undefined
                      ? String(field.value)
                      : UNASSIGNED_VALUE
                  }
                  onValueChange={(value) => {
                    field.onChange(
                      value === UNASSIGNED_VALUE ? undefined : Number(value),
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
                    <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
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
      )}
      onSubmit={async (values) => {
        await mutation.mutateAsync(values)
      }}
    />
  )
}
