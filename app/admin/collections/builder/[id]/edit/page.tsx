"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import BuilderForm from "@/components/BuilderForm";
import apiClient from "@/lib/api";
import { Builder } from "@/types/builder";

export default function EditBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const builderId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [builder, setBuilder] = useState<Builder | null>(null);

  useEffect(() => {
    fetchBuilder();
  }, [builderId]);

  const fetchBuilder = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/api/collections/builders/${builderId}`);
      if (response.data.success) {
        setBuilder(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch builder");
      console.error("Error fetching builder:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await apiClient.put(`/api/collections/builders/${builderId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        router.push("/admin/collections");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update builder";
      setError(message);
      console.error("Error updating builder:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!builder) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            {error || "Builder not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Builder
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update builder/developer profile
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <BuilderForm
        onSubmit={handleSubmit}
        initialData={{
          id: builder.id,
          name: builder.name,
          email: builder.email,
          phone: builder.phone?.replace(/^\+91\s*/, "") || "",
          website: builder.website,
          description: builder.description,
          profilePicture: builder.profilePicture,
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
