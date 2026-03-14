/**
 * Utility function to get the full image URL
 * Handles both relative paths (prepends API URL) and full URLs (Supabase, external, etc.)
 */
export function getImageUrl(imagePath: string | undefined | null): string {
  if (!imagePath) {
    // Return a placeholder SVG data URI for missing images
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='system-ui,-apple-system' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
  }

  // If it's already a full URL (Supabase, external, or blob), use it as is
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  // If it's a relative path, prepend API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return `${apiUrl}${imagePath}`;
}

/**
 * Get the first image URL from an array of image paths
 */
export function getFirstImageUrl(images: string[] | undefined | null): string {
  if (!images || images.length === 0) {
    return getImageUrl(null);
  }
  return getImageUrl(images[0]);
}
