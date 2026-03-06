"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import FeaturedPropertyForm from "@/components/FeaturedPropertyForm";
import { FeaturedPropertyFormData } from "@/types/featured";
import apiClient from "@/lib/api";

export default function EditFeaturedPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const featuredId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [initialData, setInitialData] = useState<Partial<FeaturedPropertyFormData> & { existingGallery?: { id: string; type: "image" | "video"; url: string }[]; existingClientLogos?: string[] }>({});

  useEffect(() => {
    fetchFeaturedProperty();
  }, [featuredId]);

  const fetchFeaturedProperty = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.get(`/api/collections/featured/${featuredId}`);
      
      if (response.data.success) {
        const featured = response.data.data;
        setInitialData({
          title: featured.title,
          description: featured.description,
          existingGallery: featured.gallery || [],
          existingClientLogos: featured.clientLogos || [],
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch featured property");
      console.error("Error fetching featured property:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: FeaturedPropertyFormData) => {
    try {
      setIsSubmitting(true);
      setError("");

      const formData = new FormData();
      formData.append("title", data.title);
      if (data.description) {
        formData.append("description", data.description);
      }

      // Append existing gallery IDs to keep
      if (data.existingGallery && data.existingGallery.length > 0) {
        formData.append("existingGallery", JSON.stringify(data.existingGallery));
      }

      // Append new gallery files
      if (data.gallery && data.gallery.length > 0) {
        data.gallery.forEach((item: { file: File }) => {
          formData.append("gallery", item.file);
        });
      }

      // Append new client logos
      if (data.clientLogos && data.clientLogos.length > 0) {
        data.clientLogos.forEach((logo: File) => {
          formData.append("logos", logo);
        });
      }

      const response = await apiClient.put(`/api/collections/featured/${featuredId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        router.push("/admin/collections");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update featured property";
      setError(message);
      console.error("Error updating featured property:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Featured Property
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update featured property details
        </p>
      </div>
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading featured property...</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <FeaturedPropertyForm onSubmit={handleSubmit} initialData={initialData} isSubmitting={isSubmitting} />
        </>
      )}
    </div>
  );
}

