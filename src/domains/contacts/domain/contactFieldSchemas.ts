import {
  buildEntityFormSchema,
  createDefaultEntityValues,
  getDefaultRequiredFieldIds,
  getDefaultVisibleFieldIds,
  resolveRequiredFields,
  resolveVisibleFields,
  sanitizeFieldIds,
  type EntityFieldDefinition,
  type EntityFieldDataType,
} from "@/domains/entities/domain/entityFieldSchemas"

export type ContactFieldDataType = EntityFieldDataType

export type ContactFieldDefinition = EntityFieldDefinition

export const coreContactFieldDefinitions: ContactFieldDefinition[] = [
  {
    id: "firstname",
    label: "First name",
    placeholder: "Jamie",
    dataType: "text",
    autoComplete: "given-name",
    kind: "core",
    defaultRequired: true,
    defaultVisible: true,
  },
  {
    id: "lastname",
    label: "Last name",
    placeholder: "Doe",
    dataType: "text",
    autoComplete: "family-name",
    kind: "core",
    defaultRequired: true,
    defaultVisible: true,
  },
  {
    id: "title",
    label: "Title",
    placeholder: "VP of Operations",
    dataType: "text",
    autoComplete: "organization-title",
    kind: "core",
    defaultRequired: false,
    defaultVisible: true,
  },
  {
    id: "email",
    label: "Email",
    placeholder: "jamie@acme.com",
    dataType: "email",
    autoComplete: "email",
    kind: "core",
    defaultRequired: true,
    defaultVisible: true,
  },
  {
    id: "phone",
    label: "Phone",
    placeholder: "(555) 555-1234",
    dataType: "text",
    autoComplete: "tel",
    kind: "core",
    defaultRequired: false,
    defaultVisible: true,
  },
  {
    id: "account_id",
    label: "Account",
    description: "Link this contact to an account",
    dataType: "number",
    kind: "core",
    defaultRequired: false,
    defaultVisible: true,
  },
  {
    id: "assigned_user_id",
    label: "Owner",
    description: "Assign a teammate",
    dataType: "user",
    kind: "core",
    defaultRequired: false,
    defaultVisible: true,
  },
]

export const getDefaultRequiredContactFieldIds = getDefaultRequiredFieldIds
export const getDefaultVisibleContactFieldIds = getDefaultVisibleFieldIds
export const sanitizeContactFieldIds = sanitizeFieldIds
export const resolveContactRequiredFields = resolveRequiredFields
export const resolveContactVisibleFields = resolveVisibleFields

export function buildContactFormSchema(
  definitions: ContactFieldDefinition[],
  requiredFieldIds: string[],
) {
  return buildEntityFormSchema(definitions, requiredFieldIds)
}

export function createDefaultContactValues(
  definitions: ContactFieldDefinition[],
): Record<string, unknown> {
  return createDefaultEntityValues(definitions)
}

export type ContactFormValues = {
  firstname?: string
  lastname?: string
  email?: string
  phone?: string
  title?: string
  account_id?: number
  assigned_user_id?: number
  [key: string]: unknown
}
