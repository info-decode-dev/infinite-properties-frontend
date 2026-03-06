"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReelForm from "@/components/ReelForm";
import { Property } from "@/types/property";
import apiClient from "@/lib/api";

export default function NewReelPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await apiClient.get("/api/properties");
      if (response.data.success) {
        setProperties(response.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching properties:", err);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await apiClient.post("/api/collections/reels", data);

      if (response.data.success) {
        router.push("/admin/collections");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create reel";
      setError(message);
      console.error("Error creating reel:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Add New Reel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new reel with link and action button
        </p>
      </div>
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <ReelForm onSubmit={handleSubmit} properties={properties} isSubmitting={isSubmitting} />
    </div>
  );
}

