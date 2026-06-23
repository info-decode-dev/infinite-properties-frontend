import { z } from "zod";

export const createTestimonialSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .min(5, "Title must be at least 5 characters"),
  clientName: z.string().trim().min(1, "Client name is required"),
  description: z.string().trim().optional(),
});

export const updateTestimonialSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .min(5, "Title must be at least 5 characters")
    .optional(),
  clientName: z.string().trim().min(1, "Client name cannot be empty").optional(),
  description: z.string().trim().optional(),
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
