const JSON_FIELDS = [
  "location",
  "developerInfo",
  "tags",
  "amenities",
  "accessibility",
  "nearbyLandmarks",
  "collectionIds",
  "existingImages",
  "existingGallery",
  "values",
  "statistics",
  "achievements",
  "teamMembers",
  "contactInfo",
  "clientLogos",
] as const;

function parseJsonField(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function parseFormDataFields(formData: FormData): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) continue;

    const strValue = String(value);
    if ((JSON_FIELDS as readonly string[]).includes(key)) {
      body[key] = parseJsonField(strValue);
    } else {
      body[key] = strValue;
    }
  }

  return body;
}

export function extractFiles(formData: FormData, fieldName: string): File[] {
  return formData.getAll(fieldName).filter((f): f is File => f instanceof File);
}

export function extractFile(formData: FormData, fieldName: string): File | null {
  const file = formData.get(fieldName);
  return file instanceof File ? file : null;
}

export function extractFilesByPrefix(
  formData: FormData,
  prefix: string
): Record<string, File> {
  const result: Record<string, File> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith(prefix) && value instanceof File) {
      result[key] = value;
    }
  }
  return result;
}
