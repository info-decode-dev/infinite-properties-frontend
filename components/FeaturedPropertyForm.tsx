"use client";

import { useState } from "react";
import { X, Upload, Plus } from "lucide-react";
import { FeaturedPropertyFormData } from "@/types/featured";

interface FeaturedPropertyFormProps {
  onSubmit: (data: FeaturedPropertyFormData) => void;
  initialData?: Partial<FeaturedPropertyFormData>;
  isSubmitting?: boolean;
}

export default function FeaturedPropertyForm({ onSubmit, initialData, isSubmitting = false }: FeaturedPropertyFormProps) {
  const [formData, setFormData] = useState<FeaturedPropertyFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    gallery: initialData?.gallery || [],
    existingGallery: initialData?.existingGallery || [],
    clientLogos: initialData?.clientLogos || [],
    existingClientLogos: initialData?.existingClientLogos || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newGalleryItems = files.map((file) => ({
        type: (file.type.startsWith("video/") ? "video" : "image") as "image" | "video",
        file,
      }));
      setFormData({
        ...formData,
        gallery: [...formData.gallery, ...newGalleryItems],
      });
    }
  };

  const removeGalleryItem = (index: number) => {
    setFormData({
      ...formData,
      gallery: formData.gallery.filter((_, i) => i !== index),
    });
  };

  const removeExistingGalleryItem = (index: number) => {
    setFormData({
      ...formData,
      existingGallery: formData.existingGallery?.filter((_, i) => i !== index) || [],
    });
  };

  const handleClientLogosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData({
        ...formData,
        clientLogos: [...formData.clientLogos, ...files],
      });
    }
  };

  const removeClientLogo = (index: number) => {
    setFormData({
      ...formData,
      clientLogos: formData.clientLogos.filter((_, i) => i !== index),
    });
  };

  const removeExistingClientLogo = (index: number) => {
    setFormData({
      ...formData,
      existingClientLogos: formData.existingClientLogos?.filter((_, i) => i !== index) || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter featured property title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter featured property description"
          />
        </div>
      </div>

      {/* Gallery */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gallery</h2>

        {/* Existing Gallery */}
        {formData.existingGallery && formData.existingGallery.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Existing Gallery Items
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.existingGallery.map((itemId, index) => (
                <div key={index} className="relative group">
                  <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Item {index + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExistingGalleryItem(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Gallery Items */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add Gallery Items (Images/Videos)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.gallery.map((item, index) => (
              <div key={index} className="relative group">
                {item.type === "image" ? (
                  <img
                    src={URL.createObjectURL(item.file)}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(item.file)}
                    className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeGalleryItem(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <Upload className="w-6 h-6 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Add Media</span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleGalleryChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Client Logos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Client Logos</h2>

        {/* Existing Logos */}
        {formData.existingClientLogos && formData.existingClientLogos.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Existing Logos
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.existingClientLogos.map((logoUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={logoUrl}
                    alt={`Logo ${index + 1}`}
                    className="w-full h-24 object-contain bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 p-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingClientLogo(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Logos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add Client Logos
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.clientLogos.map((logo, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(logo)}
                  alt={`Logo ${index + 1}`}
                  className="w-full h-24 object-contain bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 p-2"
                />
                <button
                  type="button"
                  onClick={() => removeClientLogo(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <Upload className="w-5 h-5 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Add Logo</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleClientLogosChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Featured Property"}
        </button>
      </div>
    </form>
  );
}

