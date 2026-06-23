import prisma from "../db";
import { AppError } from "../errors";
import { geocodeLocation } from "../geocode";
import { uploadFilesToSupabase } from "../storage";
import { isLandType } from "../validators/property";
import type { CreatePropertyInput, UpdatePropertyInput } from "../validators/property";

const propertyInclude = {
  location: true,
  developerInfo: true,
  amenities: true,
  accessibility: true,
  collections: { include: { curatedCollection: true } },
};

export async function getAllProperties(query: Record<string, string | undefined>) {
  const { search, city, state, bhkType, constructionStatus, page = "1", limit = "10" } = query;
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (city) where.location = { city };
  if (state) where.location = { ...(where.location as object), state };
  if (bhkType) where.bhkType = bhkType;
  if (constructionStatus) where.constructionStatus = constructionStatus;

  const skip = (Number(page) - 1) * Number(limit);
  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        location: true,
        developerInfo: true,
        amenities: true,
        accessibility: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    }),
    prisma.property.count({ where }),
  ]);

  return {
    success: true,
    count: properties.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: properties,
  };
}

export async function getAllPropertiesPublic(query: Record<string, string | undefined>) {
  const {
    search,
    city,
    state,
    bhkType,
    constructionStatus,
    collectionId,
    page = "1",
    limit = "10",
  } = query;
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (city) where.location = { city };
  if (state) where.location = { ...(where.location as object), state };
  if (bhkType) where.bhkType = bhkType;
  if (constructionStatus) where.constructionStatus = constructionStatus;
  if (collectionId) {
    where.collections = { some: { curatedCollectionId: collectionId } };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        location: true,
        developerInfo: true,
        amenities: true,
        accessibility: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    }),
    prisma.property.count({ where }),
  ]);

  return {
    success: true,
    count: properties.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: properties,
  };
}

export async function getPropertyById(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      location: true,
      developerInfo: true,
      amenities: true,
      accessibility: true,
    },
  });
  if (!property) throw new AppError("Property not found", 404);
  return { success: true, data: property };
}

export async function createProperty(input: CreatePropertyInput, imageFiles: File[]) {
  const images = await uploadFilesToSupabase(imageFiles, "images", "images");

  const location = input.location;
  let latitude = location.latitude ? parseFloat(String(location.latitude)) : null;
  let longitude = location.longitude ? parseFloat(String(location.longitude)) : null;

  if (!latitude || !longitude) {
    const geocodeResult = await geocodeLocation({
      exactLocation: location.exactLocation,
      city: location.city,
      state: location.state,
      country: location.country,
      pincode: location.pincode || undefined,
    });
    if (geocodeResult.success && geocodeResult.latitude && geocodeResult.longitude) {
      latitude = geocodeResult.latitude;
      longitude = geocodeResult.longitude;
    }
  }

  const locationData = await prisma.location.create({
    data: {
      exactLocation: location.exactLocation,
      city: location.city,
      state: location.state,
      country: location.country,
      pincode: location.pincode || null,
      latitude,
      longitude,
    },
  });

  const developerInfo = input.developerInfo;
  const developerData = await prisma.developerInfo.create({
    data:
      !isLandType(input.propertyType) && developerInfo?.name
        ? {
            name: developerInfo.name,
            email: developerInfo.email || null,
            phone: developerInfo.phone || null,
            website: developerInfo.website || null,
            description: developerInfo.description || null,
          }
        : {
            name: "N/A",
            email: null,
            phone: null,
            website: null,
            description: null,
          },
  });

  const property = await prisma.property.create({
    data: {
      title: input.title,
      description: input.description,
      images,
      actualPrice: input.actualPrice,
      offerPrice: input.offerPrice ?? null,
      bhkType: isLandType(input.propertyType) ? null : input.bhkType || null,
      propertyType: input.propertyType,
      constructionStatus: isLandType(input.propertyType)
        ? null
        : input.constructionStatus || null,
      landArea: input.landArea,
      landAreaUnit: input.landAreaUnit,
      builtUpArea: isLandType(input.propertyType) ? null : input.builtUpArea ?? null,
      furnishedStatus: isLandType(input.propertyType) ? null : input.furnishedStatus || null,
      negotiation: input.negotiation || null,
      nearbyLandmarks: input.nearbyLandmarks || [],
      tags: isLandType(input.propertyType) ? [] : input.tags || [],
      landType: isLandType(input.propertyType) ? input.landType || null : null,
      plotSize: isLandType(input.propertyType) ? input.plotSize ?? null : null,
      plotSizeUnit: isLandType(input.propertyType) ? input.plotSizeUnit || null : null,
      ownership: isLandType(input.propertyType) ? input.ownership || null : null,
      locationId: locationData.id,
      developerInfoId: developerData.id,
      amenities: {
        create: (input.amenities || []).map((a) => ({
          name: a.name,
          icon: a.icon,
        })),
      },
      accessibility:
        input.accessibility && input.accessibility.length > 0
          ? {
              create: input.accessibility.map((a) => ({
                name: a.name,
                distance: parseFloat(String(a.distance)),
                unit: a.unit,
              })),
            }
          : undefined,
      collections:
        input.collectionIds && input.collectionIds.length > 0
          ? {
              create: input.collectionIds.map((collectionId) => ({
                curatedCollectionId: collectionId,
              })),
            }
          : undefined,
    },
    include: propertyInclude,
  });

  return {
    success: true,
    message: "Property created successfully",
    data: property,
  };
}

export async function updateProperty(
  id: string,
  input: UpdatePropertyInput,
  imageFiles: File[]
) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: { location: true, developerInfo: true, collections: true },
  });
  if (!property) throw new AppError("Property not found", 404);

  let images = property.images || [];
  if (input.existingImages && input.existingImages.length > 0) {
    images = input.existingImages;
  }

  if (imageFiles.length > 0) {
    const newImages = await uploadFilesToSupabase(imageFiles, "images", "images");
    images = [...images, ...newImages];
  }

  const propertyType = input.propertyType || property.propertyType;
  const updateData: Record<string, unknown> = {
    title: input.title,
    description: input.description,
    actualPrice: input.actualPrice,
    offerPrice: input.offerPrice,
    propertyType,
    landArea: input.landArea,
    landAreaUnit: input.landAreaUnit,
    negotiation: input.negotiation,
    nearbyLandmarks: input.nearbyLandmarks,
    images,
  };

  if (isLandType(propertyType)) {
    updateData.bhkType = null;
    updateData.constructionStatus = null;
    updateData.builtUpArea = null;
    updateData.furnishedStatus = null;
    updateData.tags = [];
    updateData.landType = input.landType ?? null;
    updateData.plotSize = input.plotSize ?? null;
    updateData.plotSizeUnit = input.plotSizeUnit ?? null;
    updateData.ownership = input.ownership ?? null;
  } else {
    updateData.bhkType = input.bhkType;
    updateData.constructionStatus = input.constructionStatus;
    updateData.builtUpArea = input.builtUpArea;
    updateData.furnishedStatus = input.furnishedStatus;
    updateData.tags = input.tags || [];
    updateData.landType = null;
    updateData.plotSize = null;
    updateData.plotSizeUnit = null;
    updateData.ownership = null;
  }

  Object.keys(updateData).forEach((key) => {
    if (updateData[key] === undefined) delete updateData[key];
  });

  if (input.location) {
    const location = input.location;
    let latitude = location.latitude ? parseFloat(String(location.latitude)) : null;
    let longitude = location.longitude ? parseFloat(String(location.longitude)) : null;

    if (!latitude || !longitude) {
      const geocodeResult = await geocodeLocation({
        exactLocation: location.exactLocation,
        city: location.city,
        state: location.state,
        country: location.country,
        pincode: location.pincode || undefined,
      });
      if (geocodeResult.success && geocodeResult.latitude && geocodeResult.longitude) {
        latitude = geocodeResult.latitude;
        longitude = geocodeResult.longitude;
      }
    }

    await prisma.location.update({
      where: { id: property.locationId },
      data: {
        exactLocation: location.exactLocation,
        city: location.city,
        state: location.state,
        country: location.country,
        pincode: location.pincode || null,
        latitude,
        longitude,
      },
    });
  }

  if (input.developerInfo && !isLandType(propertyType)) {
    await prisma.developerInfo.update({
      where: { id: property.developerInfoId },
      data: {
        name: input.developerInfo.name || "N/A",
        email: input.developerInfo.email || null,
        phone: input.developerInfo.phone || null,
        website: input.developerInfo.website || null,
        description: input.developerInfo.description || null,
      },
    });
  }

  if (input.amenities) {
    await prisma.propertyAmenity.deleteMany({ where: { propertyId: property.id } });
    if (input.amenities.length > 0) {
      await prisma.propertyAmenity.createMany({
        data: input.amenities.map((a) => ({
          propertyId: property.id,
          name: a.name,
          icon: a.icon,
        })),
      });
    }
  }

  if (input.accessibility) {
    await prisma.propertyAccessibility.deleteMany({ where: { propertyId: property.id } });
    if (input.accessibility.length > 0) {
      await prisma.propertyAccessibility.createMany({
        data: input.accessibility.map((a) => ({
          propertyId: property.id,
          name: a.name,
          distance: parseFloat(String(a.distance)),
          unit: a.unit,
        })),
      });
    }
  }

  if (input.collectionIds !== undefined) {
    await prisma.propertyCollection.deleteMany({ where: { propertyId: property.id } });
    if (input.collectionIds.length > 0) {
      updateData.collections = {
        create: input.collectionIds.map((collectionId) => ({
          curatedCollectionId: collectionId,
        })),
      };
    }
  }

  const updatedProperty = await prisma.property.update({
    where: { id },
    data: updateData,
    include: propertyInclude,
  });

  return {
    success: true,
    message: "Property updated successfully",
    data: updatedProperty,
  };
}

export async function deleteProperty(id: string) {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new AppError("Property not found", 404);
  await prisma.property.delete({ where: { id } });
  return { success: true, message: "Property deleted successfully" };
}

export async function getDashboardStats() {
  const totalProperties = await prisma.property.count();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const newThisMonth = await prisma.property.count({
    where: { createdAt: { gte: startOfMonth } },
  });
  const featured = await prisma.property.count({
    where: { tags: { has: "Featured" } },
  });
  const testimonials = await prisma.testimonial.count();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentProperties = await prisma.property.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
  });

  const monthlyData: Record<string, number> = {};
  recentProperties.forEach((item) => {
    const month = new Date(item.createdAt).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });

  const bhkStats = await prisma.property.groupBy({ by: ["bhkType"], _count: true });
  const statusStats = await prisma.property.groupBy({
    by: ["constructionStatus"],
    _count: true,
  });

  return {
    success: true,
    data: {
      totalProperties,
      newThisMonth,
      featured,
      testimonials,
      monthlyData,
      bhkStats: bhkStats.map((item) => ({ type: item.bhkType, count: item._count })),
      statusStats: statusStats.map((item) => ({
        status: item.constructionStatus,
        count: item._count,
      })),
    },
  };
}
