"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TestimonialForm from "@/components/TestimonialForm";
import apiClient from "@/lib/api";

export default function NewTestimonialPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: any) => {
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

      // Append profile picture if provided
      if (data.profilePicture) {
        formData.append("profilePicture", data.profilePicture);
      }

      // Append property media if provided
      if (data.propertyMedia && data.propertyMedia.file) {
        formData.append("media", data.propertyMedia.file);
      }

      const response = await apiClient.post("/api/testimonials", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        router.push("/admin/testimonials");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create testimonial";
      setError(message);
      console.error("Error creating testimonial:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Add New Testimonial
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new client testimonial
        </p>
      </div>
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <TestimonialForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}

