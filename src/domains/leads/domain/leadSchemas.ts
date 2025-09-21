import { z } from "zod"

export type LeadFieldDataType = "text" | "email" | "number" | "user"

export type LeadFieldDefinition = {
  id: string
  label: string
  description?: string
  placeholder?: string
  dataType: LeadFieldDataType
  autoComplete?: string
  kind: "core" | "custom"
  defaultRequired?: boolean
  defaultVisible?: boolean
}

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

export function getDefaultRequiredLeadFieldIds(
  definitions: LeadFieldDefinition[] = coreLeadFieldDefinitions,
): string[] {
  return definitions
    .filter((def) => def.defaultRequired)
    .map((def) => def.id)
}

export function getDefaultVisibleLeadFieldIds(
  definitions: LeadFieldDefinition[] = coreLeadFieldDefinitions,
): string[] {
  return definitions
    .filter((def) => def.defaultVisible ?? true)
    .map((def) => def.id)
}

export function sanitizeLeadFieldIds(
  ids: string[],
  definitions: LeadFieldDefinition[],
): string[] {
  const allowed = new Set(definitions.map((def) => def.id))
  const seen = new Set<string>()
  const result: string[] = []
  ids.forEach((id) => {
    if (allowed.has(id) && !seen.has(id)) {
      seen.add(id)
      result.push(id)
    }
  })
  return result
}

export function resolveLeadRequiredFields(
  candidate: string[] | null | undefined,
  definitions: LeadFieldDefinition[],
): string[] {
  const fallback = getDefaultRequiredLeadFieldIds(definitions)
  const sanitized = candidate ? sanitizeLeadFieldIds(candidate, definitions) : []
  if (sanitized.length === 0) {
    return fallback
  }
  const merged = [...sanitized]
  fallback.forEach((id) => {
    if (!merged.includes(id)) merged.push(id)
  })
  return merged
}

export function resolveLeadVisibleFields(
  candidate: string[] | null | undefined,
  definitions: LeadFieldDefinition[],
): string[] {
  const fallback = getDefaultVisibleLeadFieldIds(definitions)
  const sanitized = candidate ? sanitizeLeadFieldIds(candidate, definitions) : []
  if (sanitized.length === 0) {
    return fallback
  }
  const merged = [...sanitized]
  fallback.forEach((id) => {
    if (!merged.includes(id)) merged.push(id)
  })
  return merged
}

type FieldValidators = {
  required: z.ZodTypeAny
  optional: z.ZodTypeAny
}

function optionalString(base: z.ZodString) {
  return z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmed = value.trim()
        return trimmed === "" ? undefined : trimmed
      }
      return value
    },
    base.optional(),
  )
}

function validatorsFor(definition: LeadFieldDefinition): FieldValidators {
  const label = definition.label
  switch (definition.dataType) {
    case "email": {
      const base = z
        .string({
          required_error: `${label} is required`,
        })
        .trim()
        .email("Enter a valid email")
      return {
        required: base.min(1, `${label} is required`),
        optional: optionalString(base),
      }
    }
    case "number": {
      const required = z
        .coerce
        .number({
          required_error: `${label} is required`,
          invalid_type_error: `${label} must be a number`,
        })
        .refine((value) => !Number.isNaN(value), `${label} must be a number`)

      const optional = z.preprocess(
        (value) => {
          if (value === "" || value === null || value === undefined) {
            return undefined
          }
          return value
        },
        z
          .coerce.number({
            invalid_type_error: `${label} must be a number`,
          })
          .refine((value) => !Number.isNaN(value), `${label} must be a number`)
          .optional(),
      )

      return { required, optional }
    }
    case "user": {
      const required = z
        .coerce
        .number({
          required_error: `${label} is required`,
          invalid_type_error: `${label} is required`,
        })
        .int()
        .positive(`${label} is required`)

      const optional = z.preprocess(
        (value) => {
          if (value === "" || value === null || value === undefined) {
            return undefined
          }
          return value
        },
        z
          .coerce.number({
            invalid_type_error: `${label} is required`,
          })
          .int()
          .positive(`${label} is required`)
          .optional(),
      )

      return { required, optional }
    }
    case "text":
    default: {
      const base = z
        .string({
          required_error: `${label} is required`,
        })
        .trim()
      return {
        required: base.min(1, `${label} is required`),
        optional: optionalString(base),
      }
    }
  }
}

export function buildLeadFormSchema(
  definitions: LeadFieldDefinition[],
  requiredFieldIds: string[],
) {
  const defById = new Map(definitions.map((def) => [def.id, def]))
  const requiredSet = new Set(
    requiredFieldIds.filter((id) => defById.has(id)),
  )
  const shape: Record<string, z.ZodTypeAny> = {}
  definitions.forEach((def) => {
    const validators = validatorsFor(def)
    shape[def.id] = requiredSet.has(def.id)
      ? validators.required
      : validators.optional
  })
  return z.object(shape)
}

export type LeadFormValues = {
  firstname?: string
  lastname?: string
  email?: string
  company?: string
  assigned_user_id?: number
  [key: string]: unknown
}

export function createDefaultLeadValues(
  definitions: LeadFieldDefinition[],
): Record<string, unknown> {
  return definitions.reduce<Record<string, unknown>>((acc, def) => {
    if (def.dataType === "number" || def.dataType === "user") {
      acc[def.id] = undefined
    } else {
      acc[def.id] = ""
    }
    return acc
  }, {})
}
