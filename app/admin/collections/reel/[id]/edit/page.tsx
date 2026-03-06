"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ReelForm from "@/components/ReelForm";
import { ReelFormData } from "@/types/collection";
import { Property } from "@/types/property";
import apiClient from "@/lib/api";

export default function EditReelPage() {
  const router = useRouter();
  const params = useParams();
  const reelId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [initialData, setInitialData] = useState<Partial<ReelFormData>>({});
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    fetchData();
  }, [reelId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const [reelRes, propertiesRes] = await Promise.all([
        apiClient.get(`/api/collections/reels/${reelId}`),
        apiClient.get("/api/properties"),
      ]);

      if (reelRes.data.success) {
        setInitialData(reelRes.data.data);
      }
      if (propertiesRes.data.success) {
        setProperties(propertiesRes.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: ReelFormData) => {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await apiClient.put(`/api/collections/reels/${reelId}`, data);

      if (response.data.success) {
        router.push("/admin/collections");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update reel";
      setError(message);
      console.error("Error updating reel:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Reel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update reel details
        </p>
      </div>
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading reel...</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <ReelForm onSubmit={handleSubmit} initialData={initialData} properties={properties} isSubmitting={isSubmitting} />
        </>
      )}
    </div>
  );
}

