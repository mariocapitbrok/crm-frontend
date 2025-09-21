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

export type LeadFieldDataType = EntityFieldDataType

export type LeadFieldDefinition = EntityFieldDefinition

export const coreLeadFieldDefinitions: LeadFieldDefinition[] = [
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
    id: "company",
    label: "Company",
    placeholder: "Acme Inc.",
    dataType: "text",
    autoComplete: "organization",
    kind: "core",
    defaultRequired: true,
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
    id: "assigned_user_id",
    label: "Owner",
    description: "Assign a teammate to follow up",
    dataType: "user",
    kind: "core",
    defaultRequired: false,
    defaultVisible: true,
  },
]

export type LeadFormValues = {
  firstname?: string
  lastname?: string
  email?: string
  company?: string
  assigned_user_id?: number
  [key: string]: unknown
}

export const getDefaultRequiredLeadFieldIds = getDefaultRequiredFieldIds
export const getDefaultVisibleLeadFieldIds = getDefaultVisibleFieldIds
export const sanitizeLeadFieldIds = sanitizeFieldIds
export const resolveLeadRequiredFields = resolveRequiredFields
export const resolveLeadVisibleFields = resolveVisibleFields

export function buildLeadFormSchema(
  definitions: LeadFieldDefinition[],
  requiredFieldIds: string[],
) {
  return buildEntityFormSchema(definitions, requiredFieldIds)
}

export function createDefaultLeadValues(
  definitions: LeadFieldDefinition[],
): Record<string, unknown> {
  return createDefaultEntityValues(definitions)
}
