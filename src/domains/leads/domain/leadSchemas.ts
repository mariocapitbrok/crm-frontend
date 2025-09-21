import { z } from "zod"

export const leadFieldIds = [
  "firstname",
  "lastname",
  "email",
  "company",
  "assigned_user_id",
] as const

export type LeadFieldId = (typeof leadFieldIds)[number]

export type LeadFieldDefinition = {
  id: LeadFieldId
  label: string
  description?: string
  placeholder?: string
  inputType: "text" | "email" | "select"
  autoComplete?: string
  defaultRequired: boolean
}

export const leadFieldDefinitions: LeadFieldDefinition[] = [
  {
    id: "firstname",
    label: "First name",
    placeholder: "Jamie",
    inputType: "text",
    autoComplete: "given-name",
    defaultRequired: true,
  },
  {
    id: "lastname",
    label: "Last name",
    placeholder: "Doe",
    inputType: "text",
    autoComplete: "family-name",
    defaultRequired: true,
  },
  {
    id: "company",
    label: "Company",
    placeholder: "Acme Inc.",
    inputType: "text",
    autoComplete: "organization",
    defaultRequired: true,
  },
  {
    id: "email",
    label: "Email",
    placeholder: "jamie@acme.com",
    inputType: "email",
    autoComplete: "email",
    defaultRequired: true,
  },
  {
    id: "assigned_user_id",
    label: "Owner",
    description: "Assign a teammate to follow up",
    inputType: "select",
    defaultRequired: false,
  },
]

export const leadFieldDefinitionMap = Object.fromEntries(
  leadFieldDefinitions.map((def) => [def.id, def]),
) as Record<LeadFieldId, LeadFieldDefinition>

export const defaultRequiredLeadFieldIds = leadFieldDefinitions
  .filter((def) => def.defaultRequired)
  .map((def) => def.id)

type SchemaShape = {
  [K in LeadFieldId]: {
    required: z.ZodTypeAny
    optional: z.ZodTypeAny
  }
}

const schemaShape: SchemaShape = {
  firstname: {
    required: z.string().trim().min(1, "First name is required"),
    optional: z.string().trim(),
  },
  lastname: {
    required: z.string().trim().min(1, "Last name is required"),
    optional: z.string().trim(),
  },
  email: {
    required: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email"),
    optional: z.string().trim().email("Enter a valid email"),
  },
  company: {
    required: z.string().trim().min(1, "Company is required"),
    optional: z.string().trim(),
  },
  assigned_user_id: {
    required: z.number("Owner is required").int().positive(),
    optional: z.number().int().positive().optional(),
  },
}

const optionalEmail = z
  .preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined
    }
    return value
  }, z.string().trim().email("Enter a valid email"))
  .optional()

schemaShape.email.optional = optionalEmail

export function sanitizeLeadFieldIds(ids: string[]): LeadFieldId[] {
  const seen = new Set<LeadFieldId>()
  ids.forEach((id) => {
    if (leadFieldIds.includes(id as LeadFieldId)) {
      seen.add(id as LeadFieldId)
    }
  })
  return Array.from(seen)
}

export function resolveLeadRequiredFields(
  candidate?: string[] | null,
): LeadFieldId[] {
  const sanitized = candidate ? sanitizeLeadFieldIds(candidate) : []
  return sanitized.length > 0 ? sanitized : defaultRequiredLeadFieldIds
}

export function buildLeadFormSchema(requiredFields: LeadFieldId[]) {
  const requiredSet = new Set<LeadFieldId>(requiredFields)
  const shape = leadFieldIds.reduce<Record<string, z.ZodTypeAny>>(
    (acc, id) => {
      acc[id] = requiredSet.has(id)
        ? schemaShape[id].required
        : schemaShape[id].optional
      return acc
    },
    {},
  )
  return z.object(shape)
}

export const leadCreateSchema = buildLeadFormSchema(
  defaultRequiredLeadFieldIds,
)

export type LeadFormValues = z.infer<typeof leadCreateSchema>
export type LeadCreateInput = LeadFormValues
