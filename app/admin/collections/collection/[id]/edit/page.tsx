"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import CollectionForm from "@/components/CollectionForm";
import { CuratedCollectionFormData } from "@/types/collection";
import apiClient from "@/lib/api";

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [initialData, setInitialData] = useState<Partial<CuratedCollectionFormData> & { existingImage?: string }>({});

  // Helper function to format image URLs
  const formatImageUrl = (url?: string | null) => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
      return url;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${apiUrl}${url}`;
  };

  useEffect(() => {
    fetchCollection();
  }, [collectionId]);

  const fetchCollection = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.get(`/api/collections/collections/${collectionId}`);
      
      if (response.data.success) {
        const collection = response.data.data;
        setInitialData({
          title: collection.title,
          existingImage: formatImageUrl(collection.image),
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch collection");
      console.error("Error fetching collection:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: CuratedCollectionFormData & { existingImage?: string }) => {
    try {
      setIsSubmitting(true);
      setError("");

      const formData = new FormData();
      formData.append("title", data.title);
      if (data.image) {
        formData.append("image", data.image);
      }

      const response = await apiClient.put(`/api/collections/collections/${collectionId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        router.push("/admin/collections");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update collection";
      setError(message);
      console.error("Error updating collection:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Collection
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update collection details
        </p>
      </div>
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading collection...</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <CollectionForm onSubmit={handleSubmit} initialData={initialData} isSubmitting={isSubmitting} />
        </>
      )}
    </div>
  );
}

