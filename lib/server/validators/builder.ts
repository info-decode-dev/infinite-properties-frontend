import { z } from "zod";

const phoneSchema = z
  .string()
  .optional()
  .refine(
    (value) => {
      if (!value || value.trim() === "") return true;
      const cleaned = value.replace(/^\+91\s*/, "").trim();
      return /^[6-9]\d{9}$/.test(cleaned);
    },
    { message: "Please provide a valid 10-digit Indian phone number" }
  );

export const createBuilderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Builder name is required")
    .min(2, "Builder name must be between 2 and 200 characters")
    .max(200, "Builder name must be between 2 and 200 characters"),
  email: z.string().email("Please provide a valid email address").optional().or(z.literal("")),
  phone: phoneSchema,
  website: z.string().url("Please provide a valid website URL").optional().or(z.literal("")),
  description: z
    .string()
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),
});

export const updateBuilderSchema = createBuilderSchema;

export type CreateBuilderInput = z.infer<typeof createBuilderSchema>;
export type UpdateBuilderInput = z.infer<typeof updateBuilderSchema>;
