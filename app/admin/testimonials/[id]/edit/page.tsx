"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import TestimonialForm from "@/components/TestimonialForm";
import { TestimonialFormData } from "@/types/testimonial";
import apiClient from "@/lib/api";

export default function EditTestimonialPage() {
  const router = useRouter();
  const params = useParams();
  const testimonialId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [initialData, setInitialData] = useState<Partial<TestimonialFormData>>({});

  useEffect(() => {
    fetchTestimonial();
  }, [testimonialId]);

  // Helper function to format image URLs
  const formatImageUrl = (url?: string | null) => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
      return url;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${apiUrl}${url}`;
  };

  const fetchTestimonial = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.get(`/api/testimonials/${testimonialId}`);
      
      if (response.data.success) {
        const testimonial = response.data.data;
        setInitialData({
          title: testimonial.title,
          description: testimonial.description,
          clientName: testimonial.clientName,
          existingProfilePicture: formatImageUrl(testimonial.profilePicture),
          existingPropertyMedia: testimonial.propertyMedia ? {
            type: testimonial.propertyMedia.type as "image" | "video",
            url: formatImageUrl(testimonial.propertyMedia.url) || "",
          } : undefined,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch testimonial");
      console.error("Error fetching testimonial:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: TestimonialFormData & { existingProfilePicture?: string; existingPropertyMedia?: { type: "image" | "video"; url: string } }) => {
    try {
      setIsSubmitting(true);
      setError("");

      // Create FormData for file uploads
      const formData = new FormData();

      // Append text fields
      formData.append("title", data.title);
      formData.append("clientName", data.clientName);
      if (data.description) {
        formData.append("description", data.description);
      }

      // Append profile picture if provided (new upload)
      if (data.profilePicture) {
        formData.append("profilePicture", data.profilePicture);
      }

      // Append property media if provided (new upload)
      if (data.propertyMedia && data.propertyMedia.file) {
        formData.append("media", data.propertyMedia.file);
      }

      const response = await apiClient.put(`/api/testimonials/${testimonialId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        router.push("/admin/testimonials");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update testimonial";
      setError(message);
      console.error("Error updating testimonial:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Testimonial
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update testimonial details
        </p>
      </div>
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading testimonial...</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <TestimonialForm onSubmit={handleSubmit} initialData={initialData} isSubmitting={isSubmitting} />
        </>
      )}
    </div>
  );
}

