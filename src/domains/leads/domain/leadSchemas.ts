import { z } from "zod"

export const leadCreateSchema = z.object({
  firstname: z.string().trim().min(1, "First name is required"),
  lastname: z.string().trim().min(1, "Last name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  company: z.string().trim().min(1, "Company is required"),
  assigned_user_id: z
    .number({ invalid_type_error: "Select a valid owner" })
    .int()
    .positive()
    .optional(),
})

export type LeadCreateInput = z.infer<typeof leadCreateSchema>
