import { z } from "zod";

const PROPERTY_TYPES = [
  "Home",
  "Villa",
  "Flat",
  "Apartment",
  "Plot",
  "Commercial",
  "Farmhouse",
  "Bungalow",
  "Resort",
  "Warehouse",
  "Commercial Building",
  "Commercial Land",
] as const;

const BHK_TYPES = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK", "Studio"] as const;
const CONSTRUCTION_STATUSES = [
  "Ready to Move",
  "Under Construction",
  "Pre-Launch",
] as const;

export function isLandType(propertyType: string): boolean {
  return propertyType === "Plot" || propertyType === "Commercial Land";
}

const locationSchema = z.object({
  exactLocation: z.string().trim().min(1, "Exact location is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  country: z.string().trim().min(1, "Country is required"),
  pincode: z.string().optional().nullable(),
  latitude: z.union([z.number(), z.string()]).optional().nullable(),
  longitude: z.union([z.number(), z.string()]).optional().nullable(),
});

const developerInfoSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const amenitySchema = z.object({
  name: z.string(),
  icon: z.string().optional().nullable(),
});

const accessibilitySchema = z.object({
  name: z.string(),
  distance: z.union([z.number(), z.string()]),
  unit: z.string(),
});

const basePropertySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .min(10, "Title must be at least 10 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .min(50, "Description must be at least 50 characters"),
  actualPrice: z.coerce.number().min(0, "Actual price must be positive"),
  offerPrice: z.coerce.number().min(0, "Offer price must be positive").optional().nullable(),
  location: locationSchema,
  propertyType: z.enum(PROPERTY_TYPES, { message: "Invalid property type" }),
  bhkType: z.string().optional().nullable(),
  constructionStatus: z.string().optional().nullable(),
  landArea: z.coerce.number().min(0, "Land area must be positive"),
  landAreaUnit: z.enum(["cent", "acre"], {
    message: "Land area unit must be 'cent' or 'acre'",
  }),
  builtUpArea: z.coerce.number().optional().nullable(),
  furnishedStatus: z
    .enum(["Furnished", "Semi-Furnished", "Unfurnished"])
    .optional()
    .nullable(),
  negotiation: z
    .enum(["Negotiable", "Slightly Negotiable", "Not Negotiable"])
    .optional()
    .nullable(),
  tags: z.array(z.string()).optional(),
  amenities: z.array(amenitySchema).optional(),
  accessibility: z.array(accessibilitySchema).optional(),
  nearbyLandmarks: z.array(z.string()).optional(),
  developerInfo: developerInfoSchema.optional(),
  collectionIds: z.array(z.string()).optional(),
  landType: z.string().optional().nullable(),
  plotSize: z.coerce.number().optional().nullable(),
  plotSizeUnit: z.string().optional().nullable(),
  ownership: z.string().optional().nullable(),
  existingImages: z.array(z.string()).optional(),
});

function validatePropertyFields(
  data: z.infer<typeof basePropertySchema>,
  isUpdate: boolean
) {
  const errors: string[] = [];
  const land = isLandType(data.propertyType);

  if (!land) {
    if (
      !isUpdate &&
      (data.builtUpArea === undefined ||
        data.builtUpArea === null ||
        Number(data.builtUpArea) <= 0)
    ) {
      errors.push("Built up area is required for non-Plot properties");
    }
    if (data.bhkType && !BHK_TYPES.includes(data.bhkType as (typeof BHK_TYPES)[number])) {
      errors.push("Invalid BHK type");
    }
    if (
      data.constructionStatus &&
      !CONSTRUCTION_STATUSES.includes(
        data.constructionStatus as (typeof CONSTRUCTION_STATUSES)[number]
      )
    ) {
      errors.push("Invalid construction status");
    }
    if (
      data.developerInfo?.name !== undefined &&
      data.developerInfo.name !== null &&
      String(data.developerInfo.name).trim() === "" &&
      !isUpdate
    ) {
      errors.push("Developer name is required");
    }
  }

  if (land) {
    const validLandTypes = [
      "Residential Land",
      "Commercial Land",
      "Resort Land",
      "Agricultural Land",
      "Special Purpose Land",
    ];
    const validUnits = ["Cent", "Acre", "Square Feet"];
    const validOwnerships = ["Freehold", "Leasehold"];

    if (!isUpdate || data.landType) {
      if (!data.landType) errors.push("Land type is required for land properties");
      else if (!validLandTypes.includes(data.landType))
        errors.push("Invalid land type");
    }
    if (!isUpdate || data.plotSize) {
      if (!data.plotSize) errors.push("Plot size is required for land properties");
      else if (Number(data.plotSize) < 0) errors.push("Plot size must be a positive number");
    }
    if (!isUpdate || data.plotSizeUnit) {
      if (!data.plotSizeUnit) errors.push("Plot size unit is required for land properties");
      else if (!validUnits.includes(data.plotSizeUnit))
        errors.push("Invalid plot size unit");
    }
    if (!isUpdate || data.ownership) {
      if (!data.ownership) errors.push("Ownership is required for land properties");
      else if (!validOwnerships.includes(data.ownership))
        errors.push("Invalid ownership type");
    }
  }

  return errors;
}

export const createPropertySchema = basePropertySchema.superRefine((data, ctx) => {
  const errors = validatePropertyFields(data, false);
  errors.forEach((message) => ctx.addIssue({ code: "custom", message }));
});

export const updatePropertySchema = basePropertySchema
  .partial()
  .extend({
    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .min(10, "Title must be at least 10 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .min(1, "Description cannot be empty")
      .min(50, "Description must be at least 50 characters")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.propertyType) {
      const errors = validatePropertyFields(
        data as z.infer<typeof basePropertySchema>,
        true
      );
      errors.forEach((message) => ctx.addIssue({ code: "custom", message }));
    }
  });

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
