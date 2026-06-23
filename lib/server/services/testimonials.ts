import prisma from "../db";
import { AppError } from "../errors";
import { uploadFileToSupabase } from "../storage";
import type {
  CreateTestimonialInput,
  UpdateTestimonialInput,
} from "../validators/testimonial";

export async function getAllTestimonials(query: Record<string, string | undefined>) {
  const { search, page = "1", limit = "10" } = query;
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { clientName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [testimonials, total] = await Promise.all([
    prisma.testimonial.findMany({
      where,
      include: { propertyMedia: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    }),
    prisma.testimonial.count({ where }),
  ]);

  return {
    success: true,
    count: testimonials.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: testimonials,
  };
}

export async function getTestimonialById(id: string) {
  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: { propertyMedia: true },
  });
  if (!testimonial) throw new AppError("Testimonial not found", 404);
  return { success: true, data: testimonial };
}

export async function createTestimonial(
  input: CreateTestimonialInput,
  profilePicture: File | null,
  mediaFile: File | null
) {
  const testimonialData: {
    title: string;
    description?: string;
    clientName: string;
    profilePicture?: string;
  } = {
    title: input.title,
    description: input.description,
    clientName: input.clientName,
  };

  if (profilePicture) {
    const result = await uploadFileToSupabase(
      profilePicture,
      "profiles",
      "profilePicture"
    );
    if (result.url) testimonialData.profilePicture = result.url;
  }

  let mediaData: { type: string; url: string } | null = null;
  if (mediaFile) {
    const isVideo = mediaFile.type.startsWith("video/");
    const folder = isVideo ? "videos" : "images";
    const result = await uploadFileToSupabase(mediaFile, folder, "media");
    if (result.url) {
      mediaData = { type: isVideo ? "video" : "image", url: result.url };
    }
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      ...testimonialData,
      propertyMedia: mediaData ? { create: mediaData } : undefined,
    },
    include: { propertyMedia: true },
  });

  return {
    success: true,
    message: "Testimonial created successfully",
    data: testimonial,
  };
}

export async function updateTestimonial(
  id: string,
  input: UpdateTestimonialInput,
  profilePicture: File | null,
  mediaFile: File | null
) {
  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: { propertyMedia: true },
  });
  if (!testimonial) throw new AppError("Testimonial not found", 404);

  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.clientName !== undefined) updateData.clientName = input.clientName;

  if (profilePicture) {
    const result = await uploadFileToSupabase(
      profilePicture,
      "profiles",
      "profilePicture"
    );
    if (result.url) updateData.profilePicture = result.url;
  }

  if (mediaFile) {
    const isVideo = mediaFile.type.startsWith("video/");
    const folder = isVideo ? "videos" : "images";
    const result = await uploadFileToSupabase(mediaFile, folder, "media");
    if (result.url) {
      if (testimonial.propertyMedia) {
        await prisma.propertyMedia.delete({
          where: { id: testimonial.propertyMedia.id },
        });
      }
      updateData.propertyMedia = {
        create: { type: isVideo ? "video" : "image", url: result.url },
      };
    }
  }

  const updatedTestimonial = await prisma.testimonial.update({
    where: { id },
    data: updateData,
    include: { propertyMedia: true },
  });

  return {
    success: true,
    message: "Testimonial updated successfully",
    data: updatedTestimonial,
  };
}

export async function deleteTestimonial(id: string) {
  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) throw new AppError("Testimonial not found", 404);
  await prisma.testimonial.delete({ where: { id } });
  return { success: true, message: "Testimonial deleted successfully" };
}
