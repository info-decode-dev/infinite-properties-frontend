"use client";

import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { CuratedCollectionFormData } from "@/types/collection";

interface CollectionFormProps {
  onSubmit: (data: CuratedCollectionFormData & { existingImage?: string }) => void;
  initialData?: Partial<CuratedCollectionFormData & { existingImage?: string }>;
  isSubmitting?: boolean;
}

export default function CollectionForm({ onSubmit, initialData, isSubmitting = false }: CollectionFormProps) {
  const [formData, setFormData] = useState<CuratedCollectionFormData & { existingImage?: string }>({
    title: initialData?.title || "",
    image: initialData?.image || ({} as File),
    existingImage: initialData?.existingImage,
  });

  // Update form data when initialData changes (for async loading in edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        image: initialData.image || ({} as File),
        existingImage: initialData.existingImage,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image && !formData.existingImage) {
      alert("Please upload an image");
      return;
    }
    onSubmit(formData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        image: e.target.files[0],
        existingImage: undefined,
      });
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      image: {} as File,
      existingImage: undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Collection Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Collection Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter collection title"
          />
        </div>
      </div>

      {/* Image */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Collection Image</h2>

        {/* Existing Image */}
        {formData.existingImage && !formData.image?.name && (
          <div className="relative inline-block">
            <img
              src={formData.existingImage}
              alt="Collection"
              className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* New Image Preview */}
        {formData.image?.name && (
          <div className="relative inline-block">
            <img
              src={URL.createObjectURL(formData.image)}
              alt="Collection preview"
              className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Image */}
        {!formData.image?.name && !formData.existingImage && (
          <label className="flex flex-col items-center justify-center w-full max-w-md h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Add Collection Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              required={!formData.existingImage}
            />
          </label>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Collection"}
        </button>
      </div>
    </form>
  );
}

