import prisma from "../db";
import { AppError } from "../errors";
import { uploadFileToSupabase, uploadFilesToSupabase } from "../storage";
import type {
  CreateCollectionInput,
  CreateFeaturedPropertyInput,
  CreateReelInput,
} from "../validators/collection";

export async function getAllCollections(query: Record<string, string | undefined>) {
  const { search, page = "1", limit = "10" } = query;
  const where: Record<string, unknown> = {};
  if (search) where.title = { contains: search, mode: "insensitive" };

  const skip = (Number(page) - 1) * Number(limit);
  const [collections, total] = await Promise.all([
    prisma.curatedCollection.findMany({
      where,
      include: { _count: { select: { properties: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    }),
    prisma.curatedCollection.count({ where }),
  ]);

  return {
    success: true,
    count: collections.length,
    total,
    data: collections.map((c) => ({
      ...c,
      propertyCount: c._count.properties,
    })),
  };
}

export async function getCollectionById(id: string) {
  const collection = await prisma.curatedCollection.findUnique({ where: { id } });
  if (!collection) throw new AppError("Collection not found", 404);
  return { success: true, data: collection };
}

export async function createCollection(input: CreateCollectionInput, imageFile: File) {
  const result = await uploadFileToSupabase(imageFile, "images", "image");
  if (!result.url) throw new AppError("Failed to upload image", 500);

  const collection = await prisma.curatedCollection.create({
    data: { title: input.title, image: result.url },
  });

  return {
    success: true,
    message: "Collection created successfully",
    data: collection,
  };
}

export async function updateCollection(
  id: string,
  input: CreateCollectionInput,
  imageFile: File | null
) {
  const existing = await prisma.curatedCollection.findUnique({ where: { id } });
  if (!existing) throw new AppError("Collection not found", 404);

  const updateData: { title: string; image?: string } = { title: input.title };
  if (imageFile) {
    const result = await uploadFileToSupabase(imageFile, "images", "image");
    if (result.url) updateData.image = result.url;
  }

  const collection = await prisma.curatedCollection.update({
    where: { id },
    data: updateData,
  });

  return {
    success: true,
    message: "Collection updated successfully",
    data: collection,
  };
}

export async function deleteCollection(id: string) {
  const collection = await prisma.curatedCollection.findUnique({ where: { id } });
  if (!collection) throw new AppError("Collection not found", 404);
  await prisma.curatedCollection.delete({ where: { id } });
  return { success: true, message: "Collection deleted successfully" };
}

export async function getAllReels(query: Record<string, string | undefined>) {
  const { search, page = "1", limit = "10" } = query;
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { link: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [reels, total] = await Promise.all([
    prisma.reel.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    }),
    prisma.reel.count({ where }),
  ]);

  return { success: true, count: reels.length, total, data: reels };
}

export async function getReelById(id: string) {
  const reel = await prisma.reel.findUnique({ where: { id } });
  if (!reel) throw new AppError("Reel not found", 404);
  return { success: true, data: reel };
}

export async function createReel(input: CreateReelInput) {
  const reel = await prisma.reel.create({
    data: {
      link: input.link,
      title: input.title,
      description: input.description,
      actionButtonLink: input.actionButtonLink,
    },
  });
  return { success: true, message: "Reel created successfully", data: reel };
}

export async function updateReel(id: string, input: CreateReelInput) {
  const existing = await prisma.reel.findUnique({ where: { id } });
  if (!existing) throw new AppError("Reel not found", 404);

  const reel = await prisma.reel.update({
    where: { id },
    data: {
      link: input.link,
      title: input.title,
      description: input.description,
      actionButtonLink: input.actionButtonLink,
    },
  });

  return { success: true, message: "Reel updated successfully", data: reel };
}

export async function deleteReel(id: string) {
  const reel = await prisma.reel.findUnique({ where: { id } });
  if (!reel) throw new AppError("Reel not found", 404);
  await prisma.reel.delete({ where: { id } });
  return { success: true, message: "Reel deleted successfully" };
}

export async function getAllFeaturedProperties(query: Record<string, string | undefined>) {
  const { search, page = "1", limit = "10" } = query;
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [featuredProperties, total] = await Promise.all([
    prisma.featuredProperty.findMany({
      where,
      include: { gallery: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    }),
    prisma.featuredProperty.count({ where }),
  ]);

  return {
    success: true,
    count: featuredProperties.length,
    total,
    data: featuredProperties,
  };
}

export async function createFeaturedProperty(
  input: CreateFeaturedPropertyInput,
  galleryFiles: File[],
  logoFiles: File[]
) {
  if (galleryFiles.length > 5) throw new AppError("Maximum 5 gallery items allowed", 400);

  const galleryData: { type: string; url: string }[] = [];
  for (const file of galleryFiles) {
    const isVideo = file.type.startsWith("video/");
    const folder = isVideo ? "videos" : "images";
    const result = await uploadFileToSupabase(file, folder, "gallery");
    if (result.url) {
      galleryData.push({ type: isVideo ? "video" : "image", url: result.url });
    }
  }

  const clientLogos =
    logoFiles.length > 0
      ? await uploadFilesToSupabase(logoFiles, "logos", "logos")
      : input.clientLogos || [];

  const featuredProperty = await prisma.featuredProperty.create({
    data: {
      title: input.title,
      description: input.description,
      clientLogos,
      gallery: galleryData.length > 0 ? { create: galleryData } : undefined,
    },
    include: { gallery: true },
  });

  return {
    success: true,
    message: "Featured property created successfully",
    data: featuredProperty,
  };
}

export async function updateFeaturedProperty(
  id: string,
  input: CreateFeaturedPropertyInput,
  galleryFiles: File[],
  logoFiles: File[]
) {
  const featuredProperty = await prisma.featuredProperty.findUnique({
    where: { id },
    include: { gallery: true },
  });
  if (!featuredProperty) throw new AppError("Featured property not found", 404);

  const updateData: Record<string, unknown> = {
    title: input.title,
    description: input.description,
  };

  let existingGalleryIds: string[] = [];
  if (input.existingGallery) {
    existingGalleryIds = Array.isArray(input.existingGallery)
      ? input.existingGallery
      : [];
  }

  if (featuredProperty.gallery.length > 0) {
    const toDelete = featuredProperty.gallery.filter(
      (item) => !existingGalleryIds.includes(item.id)
    );
    for (const item of toDelete) {
      await prisma.featuredMedia.delete({ where: { id: item.id } });
    }
  }

  if (galleryFiles.length > 5) throw new AppError("Maximum 5 gallery items allowed", 400);
  if (existingGalleryIds.length + galleryFiles.length > 5) {
    throw new AppError("Total gallery items cannot exceed 5", 400);
  }

  const newGalleryData: { type: string; url: string }[] = [];
  for (const file of galleryFiles) {
    const isVideo = file.type.startsWith("video/");
    const folder = isVideo ? "videos" : "images";
    const result = await uploadFileToSupabase(file, folder, "gallery");
    if (result.url) {
      newGalleryData.push({ type: isVideo ? "video" : "image", url: result.url });
    }
  }
  if (newGalleryData.length > 0) {
    updateData.gallery = { create: newGalleryData };
  }

  if (logoFiles.length > 0) {
    const newLogos = await uploadFilesToSupabase(logoFiles, "logos", "logos");
    updateData.clientLogos = [...(featuredProperty.clientLogos || []), ...newLogos];
  }

  const updated = await prisma.featuredProperty.update({
    where: { id },
    data: updateData,
    include: { gallery: true },
  });

  return {
    success: true,
    message: "Featured property updated successfully",
    data: updated,
  };
}

export async function deleteFeaturedProperty(id: string) {
  const featuredProperty = await prisma.featuredProperty.findUnique({ where: { id } });
  if (!featuredProperty) throw new AppError("Featured property not found", 404);
  await prisma.featuredProperty.delete({ where: { id } });
  return { success: true, message: "Featured property deleted successfully" };
}
