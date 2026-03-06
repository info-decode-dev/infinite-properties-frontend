"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FeaturedPropertyForm from "@/components/FeaturedPropertyForm";
import apiClient from "@/lib/api";

export default function NewFeaturedPropertyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setError("");

      const formData = new FormData();
      formData.append("title", data.title);
      if (data.description) {
        formData.append("description", data.description);
      }

      // Append gallery files
      if (data.gallery && data.gallery.length > 0) {
        data.gallery.forEach((item: { file: File }) => {
          formData.append("gallery", item.file);
        });
      }

      // Append client logos
      if (data.clientLogos && data.clientLogos.length > 0) {
        data.clientLogos.forEach((logo: File) => {
          formData.append("logos", logo);
        });
      }

      const response = await apiClient.post("/api/collections/featured", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        router.push("/admin/collections");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create featured property";
      setError(message);
      console.error("Error creating featured property:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Add New Featured Property
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new featured property with media and client logos
        </p>
      </div>
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <FeaturedPropertyForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}

