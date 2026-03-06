"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BuilderForm from "@/components/BuilderForm";
import apiClient from "@/lib/api";

export default function NewBuilderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await apiClient.post("/api/collections/builders", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        router.push("/admin/collections");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create builder";
      setError(message);
      console.error("Error creating builder:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Add New Builder
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new builder/developer profile
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <BuilderForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
