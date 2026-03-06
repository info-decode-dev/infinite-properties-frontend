"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PropertyForm from "@/components/PropertyForm";
import { PropertyFormData } from "@/types/property";
import apiClient from "@/lib/api";

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [initialData, setInitialData] = useState<Partial<PropertyFormData>>({});

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.get(`/api/properties/${propertyId}`);
      
      if (response.data.success) {
        const property = response.data.data;
        setInitialData({
          title: property.title,
          description: property.description,
          actualPrice: property.actualPrice,
          offerPrice: property.offerPrice,
          location: property.location || {
            exactLocation: "",
            city: "",
            state: "",
            country: "",
            latitude: property.location?.latitude,
            longitude: property.location?.longitude,
          },
          bhkType: property.bhkType,
          propertyType: property.propertyType,
          constructionStatus: property.constructionStatus,
          landArea: property.landArea ? parseFloat(property.landArea.toString()) : undefined,
          landAreaUnit: property.landAreaUnit,
          builtUpArea: property.builtUpArea ? parseFloat(property.builtUpArea.toString()) : undefined,
          furnishedStatus: property.furnishedStatus,
          negotiation: property.negotiation,
          nearbyLandmarks: property.nearbyLandmarks || [],
          accessibility: property.accessibility || [],
          tags: property.tags || [],
          amenities: property.amenities || [],
          developerInfo: property.developerInfo || {
            name: "",
          },
          // Plot-specific fields
          landType: property.landType,
          plotSize: property.plotSize ? parseFloat(property.plotSize.toString()) : undefined,
          plotSizeUnit: property.plotSizeUnit,
          ownership: property.ownership,
          existingImages: property.images || [], // Store existing image URLs
          collections: property.collections || [], // Store existing collections
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch property");
      console.error("Error fetching property:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: PropertyFormData & { images: File[]; amenities: any[]; existingImages?: string[] }) => {
    console.log("EditPropertyPage: handleSubmit called", { data, propertyId });
    try {
      setIsSubmitting(true);
      setError("");

      // Create FormData for file uploads
      const formData = new FormData();

      // Append text fields
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("actualPrice", data.actualPrice.toString());
      if (data.offerPrice) {
        formData.append("offerPrice", data.offerPrice.toString());
      }
      formData.append("propertyType", data.propertyType);
      
      // Only append non-Plot fields if propertyType is not Plot
      if (data.propertyType !== "Plot") {
        if (data.bhkType) {
          formData.append("bhkType", data.bhkType);
        }
        if (data.constructionStatus) {
          formData.append("constructionStatus", data.constructionStatus);
        }
        if (data.builtUpArea) {
          formData.append("builtUpArea", data.builtUpArea.toString());
        }
      }
      
      if (data.landArea) {
        formData.append("landArea", data.landArea.toString());
      }
      if (data.landAreaUnit) {
        formData.append("landAreaUnit", data.landAreaUnit);
      }
      
      // Append Plot-specific fields if propertyType is Plot
      if (data.propertyType === "Plot") {
        if (data.landType) {
          formData.append("landType", data.landType);
        }
        if (data.plotSize) {
          formData.append("plotSize", data.plotSize.toString());
        }
        if (data.plotSizeUnit) {
          formData.append("plotSizeUnit", data.plotSizeUnit);
        }
        if (data.ownership) {
          formData.append("ownership", data.ownership);
        }
      }
      if (data.furnishedStatus) {
        formData.append("furnishedStatus", data.furnishedStatus);
      }
      if (data.negotiation) {
        formData.append("negotiation", data.negotiation);
      }
      if (data.nearbyLandmarks && data.nearbyLandmarks.length > 0) {
        formData.append("nearbyLandmarks", JSON.stringify(data.nearbyLandmarks));
      }
      if (data.accessibility && data.accessibility.length > 0) {
        formData.append("accessibility", JSON.stringify(data.accessibility.map((a: any) => ({
          name: a.name,
          distance: a.distance,
          unit: a.unit,
        }))));
      }
      
      // Append tags as JSON array
      formData.append("tags", JSON.stringify(data.tags || []));

      // Append location
      formData.append("location", JSON.stringify({
        exactLocation: data.location.exactLocation,
        city: data.location.city,
        state: data.location.state,
        country: data.location.country,
        latitude: data.location.latitude?.toString() || "",
        longitude: data.location.longitude?.toString() || "",
      }));

      // Append developer info (only for non-Plot properties)
      if (data.propertyType !== "Plot") {
        formData.append("developerInfo", JSON.stringify({
          name: data.developerInfo?.name || "",
          email: data.developerInfo?.email || "",
          phone: data.developerInfo?.phone || "",
          website: data.developerInfo?.website || "",
          description: data.developerInfo?.description || "",
        }));
      }

      // Append amenities
      formData.append("amenities", JSON.stringify(
        (data.amenities || []).map((a: any) => ({
          name: a.name,
          icon: a.icon || "",
        }))
      ));

      // Append new images (if any)
      data.images.forEach((file: File) => {
        formData.append("images", file);
      });

      // Send existing images that should be kept (if any were removed, they won't be in this array)
      if (data.existingImages && data.existingImages.length > 0) {
        formData.append("existingImages", JSON.stringify(data.existingImages));
      }

      // Append collection IDs if provided
      if (data.collectionIds && data.collectionIds.length > 0) {
        formData.append("collectionIds", JSON.stringify(data.collectionIds));
      }

      const response = await apiClient.put(`/api/properties/${propertyId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        router.push("/admin/properties");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update property";
      setError(message);
      console.error("Error updating property:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Property
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update property listing details
        </p>
      </div>
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading property...</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <PropertyForm onSubmit={handleSubmit} initialData={initialData} isSubmitting={isSubmitting} />
        </>
      )}
    </div>
  );
}

