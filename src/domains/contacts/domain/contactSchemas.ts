import { z } from "zod"

export const contactCreateSchema = z.object({
  firstname: z.string().trim().min(1, "First name is required"),
  lastname: z.string().trim().min(1, "Last name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || value.length >= 7,
      "Phone number looks too short",
    ),
  title: z.string().trim().optional(),
  account_id: z.number().int().positive().optional(),
  assigned_user_id: z.number().int().positive().optional(),
})

export type ContactCreateInput = z.infer<typeof contactCreateSchema>
