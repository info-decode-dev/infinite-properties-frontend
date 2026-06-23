import { z } from "zod";

export const createCollectionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters"),
});

export const createReelSchema = z.object({
  link: z.string().trim().url("Link must be a valid URL"),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters"),
  description: z.string().trim().optional(),
  actionButtonLink: z
    .string()
    .trim()
    .min(1, "Action button link is required")
    .refine(
      (value) =>
        value.startsWith("/") ||
        value.startsWith("http://") ||
        value.startsWith("https://"),
      "Action button link must be a valid URL or relative path"
    ),
});

export const createFeaturedPropertySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters"),
  description: z.string().trim().optional(),
  clientLogos: z.array(z.string()).optional(),
  existingGallery: z.union([z.array(z.string()), z.string()]).optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type CreateReelInput = z.infer<typeof createReelSchema>;
export type CreateFeaturedPropertyInput = z.infer<typeof createFeaturedPropertySchema>;
