import { z } from "zod"

export type EntityFieldDataType = "text" | "email" | "number" | "user"

export type EntityFieldDefinition = {
  id: string
  label: string
  description?: string
  placeholder?: string
  dataType: EntityFieldDataType
  autoComplete?: string
  kind: "core" | "custom"
  defaultRequired?: boolean
  defaultVisible?: boolean
}

export function getDefaultRequiredFieldIds(
  definitions: EntityFieldDefinition[],
): string[] {
  return definitions
    .filter((def) => def.defaultRequired)
    .map((def) => def.id)
}

export function getDefaultVisibleFieldIds(
  definitions: EntityFieldDefinition[],
): string[] {
  return definitions
    .filter((def) => def.defaultVisible ?? true)
    .map((def) => def.id)
}

export function sanitizeFieldIds(
  ids: string[],
  definitions: EntityFieldDefinition[],
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

export function resolveRequiredFields(
  candidate: string[] | null | undefined,
  definitions: EntityFieldDefinition[],
): string[] {
  const fallback = getDefaultRequiredFieldIds(definitions)
  const sanitized = candidate ? sanitizeFieldIds(candidate, definitions) : []
  if (sanitized.length === 0) {
    return fallback
  }
  const merged = [...sanitized]
  fallback.forEach((id) => {
    if (!merged.includes(id)) merged.push(id)
  })
  return merged
}

export function resolveVisibleFields(
  candidate: string[] | null | undefined,
  definitions: EntityFieldDefinition[],
): string[] {
  const fallback = getDefaultVisibleFieldIds(definitions)
  const sanitized = candidate ? sanitizeFieldIds(candidate, definitions) : []
  if (sanitized.length === 0) {
    return fallback
  }
  return sanitized
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

function validatorsFor(definition: EntityFieldDefinition): FieldValidators {
  const label = definition.label
  switch (definition.dataType) {
    case "email": {
      const base = z
        .string()
        .trim()
        .email("Enter a valid email")
      return {
        required: base.min(1, `${label} is required`),
        optional: optionalString(base),
      }
    }
    case "number": {
      const required = z
        .coerce.number()
        .refine((value) => !Number.isNaN(value), `${label} must be a number`)

      const optional = z.preprocess(
        (value) => {
          if (value === "" || value === null || value === undefined) {
            return undefined
          }
          return value
        },
        z
          .coerce.number()
          .refine((value) => !Number.isNaN(value), `${label} must be a number`)
          .optional(),
      )

      return { required, optional }
    }
    case "user": {
      const required = z
        .coerce.number()
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
          .coerce.number()
          .int()
          .positive(`${label} is required`)
          .optional(),
      )

      return { required, optional }
    }
    case "text":
    default: {
      const base = z
        .string()
        .trim()
      return {
        required: base.min(1, `${label} is required`),
        optional: optionalString(base),
      }
    }
  }
}

export function buildEntityFormSchema(
  definitions: EntityFieldDefinition[],
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

export function createDefaultEntityValues(
  definitions: EntityFieldDefinition[],
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
