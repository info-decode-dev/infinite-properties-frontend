import path from "path";
import { supabase, SUPABASE_STORAGE_BUCKET } from "./supabase";
import { AppError } from "./errors";

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

export type StorageFolder = "images" | "videos" | "logos" | "profiles";

export async function uploadFileToSupabase(
  file: File,
  folder: StorageFolder = "images",
  fieldName?: string
): Promise<UploadResult> {
  if (!supabase) {
    throw new AppError(
      "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      500
    );
  }

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.name) || "";
  const filename = `${fieldName || "file"}-${uniqueSuffix}${ext}`;
  const filePath = `${folder}/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    return { url: "", path: filePath, error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl, path: filePath };
}

export async function uploadFilesToSupabase(
  files: File[],
  folder: StorageFolder = "images",
  fieldName?: string
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const result = await uploadFileToSupabase(file, folder, fieldName || file.name);
    if (result.url) {
      urls.push(result.url);
    } else {
      console.error("Failed to upload file to Supabase:", result.error);
    }
  }
  return urls;
}

export async function deleteFromSupabase(filePath: string): Promise<boolean> {
  if (!supabase) return false;

  const pathToDelete = filePath.startsWith("/uploads/")
    ? filePath.replace("/uploads/", "")
    : filePath.startsWith("http")
      ? filePath.split(`${SUPABASE_STORAGE_BUCKET}/`)[1] || filePath
      : filePath;

  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .remove([pathToDelete]);

  return !error;
}
