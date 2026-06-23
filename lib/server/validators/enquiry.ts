import { z } from "zod";

export const createEnquirySchema = z.object({
  userName: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  userEmail: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please provide a valid email address"),
  userPhone: z
    .string()
    .trim()
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      "Please provide a valid phone number"
    )
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .max(1000, "Message must not exceed 1000 characters")
    .optional(),
  propertyId: z.string().trim().min(1, "Property ID is required"),
});

export const updateEnquiryStatusSchema = z.object({
  status: z.enum(["pending", "contacted", "closed"], {
    message: "Status must be one of: pending, contacted, closed",
  }),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type UpdateEnquiryStatusInput = z.infer<typeof updateEnquiryStatusSchema>;
