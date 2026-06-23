import prisma from "../db";
import { AppError } from "../errors";
import { uploadFileToSupabase } from "../storage";
import type { CreateBuilderInput } from "../validators/builder";

function formatPhone(phone?: string | null): string | null {
  if (!phone || !phone.trim()) return null;
  const cleanedPhone = phone.replace(/^\+91\s*/, "").trim();
  return `+91 ${cleanedPhone}`;
}

export async function getAllBuilders(query: Record<string, string | undefined>) {
  const { search, page = "1", limit = "50" } = query;
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [builders, total] = await Promise.all([
    prisma.builder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    }),
    prisma.builder.count({ where }),
  ]);

  return {
    success: true,
    count: builders.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: builders,
  };
}

export async function getBuilderById(id: string) {
  const builder = await prisma.builder.findUnique({ where: { id } });
  if (!builder) throw new AppError("Builder not found", 404);
  return { success: true, data: builder };
}

export async function createBuilder(input: CreateBuilderInput, profilePicture: File | null) {
  let profilePictureUrl: string | null = null;
  if (profilePicture) {
    const result = await uploadFileToSupabase(
      profilePicture,
      "profiles",
      "profilePicture"
    );
    if (result.url) profilePictureUrl = result.url;
  }

  const builder = await prisma.builder.create({
    data: {
      name: input.name,
      email: input.email || null,
      phone: formatPhone(input.phone),
      website: input.website || null,
      description: input.description || null,
      profilePicture: profilePictureUrl,
    },
  });

  return {
    success: true,
    message: "Builder created successfully",
    data: builder,
  };
}

export async function updateBuilder(
  id: string,
  input: CreateBuilderInput,
  profilePicture: File | null
) {
  const builder = await prisma.builder.findUnique({ where: { id } });
  if (!builder) throw new AppError("Builder not found", 404);

  let profilePictureUrl = builder.profilePicture;
  if (profilePicture) {
    const result = await uploadFileToSupabase(
      profilePicture,
      "profiles",
      "profilePicture"
    );
    if (result.url) profilePictureUrl = result.url;
  }

  const updatedBuilder = await prisma.builder.update({
    where: { id },
    data: {
      name: input.name,
      email: input.email || null,
      phone: formatPhone(input.phone),
      website: input.website || null,
      description: input.description || null,
      profilePicture: profilePictureUrl,
    },
  });

  return {
    success: true,
    message: "Builder updated successfully",
    data: updatedBuilder,
  };
}

export async function deleteBuilder(id: string) {
  const builder = await prisma.builder.findUnique({ where: { id } });
  if (!builder) throw new AppError("Builder not found", 404);
  await prisma.builder.delete({ where: { id } });
  return { success: true, message: "Builder deleted successfully" };
}
