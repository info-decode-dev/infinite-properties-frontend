import prisma from "../db";
import { AppError } from "../errors";
import { uploadFileToSupabase } from "../storage";
import type { CreateEnquiryInput } from "../validators/enquiry";

const aboutUsInclude = {
  statistics: true,
  achievements: true,
  teamMembers: { include: { socialLinks: true } },
  contactInfo: { include: { socialMedia: true } },
};

export async function getAboutUs() {
  const aboutUs = await prisma.aboutUs.findFirst({ include: aboutUsInclude });
  return { success: true, data: aboutUs };
}

export async function deleteAboutUs() {
  const aboutUs = await prisma.aboutUs.findFirst();
  if (!aboutUs) throw new AppError("About Us not found", 404);
  await prisma.aboutUs.delete({ where: { id: aboutUs.id } });
  return { success: true, message: "About Us deleted successfully" };
}

export async function createOrUpdateAboutUs(
  body: Record<string, unknown>,
  imageFiles: File[],
  teamMemberImages: Record<string, File>
) {
  const companyName = String(body.companyName || "").trim();
  if (!companyName) throw new AppError("Company name is required", 400);

  const values = (body.values as string[]) || [];
  const statistics = (body.statistics as Array<Record<string, string>>) || [];
  const achievements = (body.achievements as Array<Record<string, string>>) || [];
  const teamMembers = (body.teamMembers as Array<Record<string, unknown>>) || [];
  const contactInfo = body.contactInfo as Record<string, unknown> | null;

  const processedTagline =
    body.tagline && String(body.tagline).trim() ? String(body.tagline).trim() : null;
  const processedMission =
    body.mission && String(body.mission).trim() ? String(body.mission).trim() : null;
  const processedVision =
    body.vision && String(body.vision).trim() ? String(body.vision).trim() : null;
  const processedStory =
    body.story && String(body.story).trim() ? String(body.story).trim() : null;

  const newImageUrls: string[] = [];
  for (const file of imageFiles) {
    const result = await uploadFileToSupabase(file, "images", "images");
    if (result.url) newImageUrls.push(result.url);
  }

  const teamMemberImageMap: Record<number, string> = {};
  for (const [fieldname, file] of Object.entries(teamMemberImages)) {
    const index = parseInt(fieldname.split("_")[1]);
    if (!isNaN(index)) {
      const result = await uploadFileToSupabase(file, "images", fieldname);
      if (result.url) teamMemberImageMap[index] = result.url;
    }
  }

  const existingImagesToKeep = (body.existingImages as string[]) || [];
  const existing = await prisma.aboutUs.findFirst();

  const buildTeamMembers = () =>
    teamMembers.map((tm, index) => ({
      name: String(tm.name),
      position: String(tm.position),
      bio: tm.bio ? String(tm.bio) : null,
      image: teamMemberImageMap[index] || (tm.image ? String(tm.image) : null),
      email: tm.email ? String(tm.email) : null,
      socialLinks: tm.socialLinks
        ? {
            create: {
              linkedin: (tm.socialLinks as Record<string, string>).linkedin,
              twitter: (tm.socialLinks as Record<string, string>).twitter,
              facebook: (tm.socialLinks as Record<string, string>).facebook,
            },
          }
        : undefined,
    }));

  const buildContactInfo = () => {
    if (!contactInfo) return undefined;
    const hasContent =
      contactInfo.address ||
      contactInfo.phone ||
      contactInfo.email ||
      contactInfo.website ||
      contactInfo.socialMedia;
    if (!hasContent) return undefined;

    return {
      create: {
        address: contactInfo.address ? String(contactInfo.address) : null,
        phone: contactInfo.phone ? String(contactInfo.phone) : null,
        email: contactInfo.email ? String(contactInfo.email) : null,
        website: contactInfo.website ? String(contactInfo.website) : null,
        socialMedia: contactInfo.socialMedia
          ? {
              create: {
                facebook: (contactInfo.socialMedia as Record<string, string>).facebook,
                twitter: (contactInfo.socialMedia as Record<string, string>).twitter,
                instagram: (contactInfo.socialMedia as Record<string, string>).instagram,
                linkedin: (contactInfo.socialMedia as Record<string, string>).linkedin,
                youtube: (contactInfo.socialMedia as Record<string, string>).youtube,
              },
            }
          : undefined,
      },
    };
  };

  if (existing) {
    const images = [...existingImagesToKeep, ...newImageUrls];

    await Promise.all([
      prisma.aboutUsStatistic.deleteMany({ where: { aboutUsId: existing.id } }),
      prisma.aboutUsAchievement.deleteMany({ where: { aboutUsId: existing.id } }),
      prisma.aboutUsTeamMember.deleteMany({ where: { aboutUsId: existing.id } }),
      prisma.aboutUsContactInfo.deleteMany({ where: { aboutUsId: existing.id } }),
    ]);

    const aboutUs = await prisma.aboutUs.update({
      where: { id: existing.id },
      data: {
        companyName,
        tagline: processedTagline,
        mission: processedMission,
        vision: processedVision,
        story: processedStory,
        values,
        images,
        statistics: {
          create: statistics.map((s) => ({
            label: s.label,
            value: s.value,
            icon: s.icon,
            suffix: s.suffix,
            prefix: s.prefix,
          })),
        },
        achievements: {
          create: achievements.map((a) => ({
            title: a.title,
            value: a.value,
            icon: a.icon,
            description: a.description,
          })),
        },
        teamMembers: { create: buildTeamMembers() },
        contactInfo: buildContactInfo(),
      },
      include: aboutUsInclude,
    });

    return {
      success: true,
      message: "About Us updated successfully",
      data: aboutUs,
    };
  }

  const aboutUs = await prisma.aboutUs.create({
    data: {
      companyName,
      tagline: processedTagline,
      mission: processedMission,
      vision: processedVision,
      story: processedStory,
      values,
      images: newImageUrls,
      statistics: {
        create: statistics.map((s) => ({
          label: s.label,
          value: s.value,
          icon: s.icon,
          suffix: s.suffix,
          prefix: s.prefix,
        })),
      },
      achievements: {
        create: achievements.map((a) => ({
          title: a.title,
          value: a.value,
          icon: a.icon,
          description: a.description,
        })),
      },
      teamMembers: { create: buildTeamMembers() },
      contactInfo: buildContactInfo(),
    },
    include: aboutUsInclude,
  });

  return {
    success: true,
    message: "About Us created successfully",
    data: aboutUs,
  };
}

export async function createEnquiry(input: CreateEnquiryInput) {
  const property = await prisma.property.findUnique({ where: { id: input.propertyId } });
  if (!property) throw new AppError("Property not found", 404);

  const enquiry = await prisma.enquiry.create({
    data: {
      userName: input.userName,
      userEmail: input.userEmail,
      userPhone: input.userPhone || null,
      message: input.message || null,
      propertyId: input.propertyId,
      status: "pending",
    },
    include: {
      property: { include: { location: true, developerInfo: true } },
    },
  });

  return {
    success: true,
    message: "Enquiry submitted successfully",
    data: enquiry,
  };
}

export async function getAllEnquiries(query: Record<string, string | undefined>) {
  const {
    status,
    propertyId,
    search,
    startDate,
    endDate,
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (propertyId) where.propertyId = propertyId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate);
    if (endDate) (where.createdAt as Record<string, Date>).lte = new Date(endDate);
  }
  if (search) {
    where.OR = [
      { userName: { contains: search, mode: "insensitive" } },
      { userEmail: { contains: search, mode: "insensitive" } },
      { userPhone: { contains: search, mode: "insensitive" } },
      { message: { contains: search, mode: "insensitive" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const validSortFields = ["createdAt", "updatedAt", "userName", "userEmail", "status"];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
  const orderBy: Record<string, "asc" | "desc"> = {
    [sortField]: sortOrder === "asc" ? "asc" : "desc",
  };

  const total = await prisma.enquiry.count({ where });
  const enquiries = await prisma.enquiry.findMany({
    where,
    include: {
      property: { include: { location: true, developerInfo: true } },
    },
    orderBy,
    skip,
    take: limitNum,
  });

  return {
    success: true,
    data: enquiries,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

export async function getEnquiryById(id: string) {
  const enquiry = await prisma.enquiry.findUnique({
    where: { id },
    include: {
      property: {
        include: { location: true, developerInfo: true, amenities: true },
      },
    },
  });
  if (!enquiry) throw new AppError("Enquiry not found", 404);
  return { success: true, data: enquiry };
}

export async function updateEnquiryStatus(id: string, status: string) {
  if (!["pending", "contacted", "closed"].includes(status)) {
    throw new AppError("Invalid status", 400);
  }

  const enquiry = await prisma.enquiry.update({
    where: { id },
    data: { status },
    include: { property: { include: { location: true } } },
  });

  return { success: true, data: enquiry };
}

export async function deleteEnquiry(id: string) {
  const enquiry = await prisma.enquiry.findUnique({ where: { id } });
  if (!enquiry) throw new AppError("Enquiry not found", 404);
  await prisma.enquiry.delete({ where: { id } });
  return { success: true, message: "Enquiry deleted successfully" };
}

export async function getEnquiryStats() {
  const total = await prisma.enquiry.count();
  const pending = await prisma.enquiry.count({ where: { status: "pending" } });
  const contacted = await prisma.enquiry.count({ where: { status: "contacted" } });
  const closed = await prisma.enquiry.count({ where: { status: "closed" } });

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentEnquiries = await prisma.enquiry.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
  });

  const monthlyData: Record<string, number> = {};
  recentEnquiries.forEach((item) => {
    const month = new Date(item.createdAt).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });

  return {
    success: true,
    data: { total, pending, contacted, closed, monthlyData },
  };
}
