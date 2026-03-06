"use client";

import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { TestimonialFormData } from "@/types/testimonial";

interface TestimonialFormProps {
  onSubmit: (data: TestimonialFormData & { existingProfilePicture?: string; existingPropertyMedia?: { type: "image" | "video"; url: string } }) => void;
  initialData?: Partial<TestimonialFormData & { existingProfilePicture?: string; existingPropertyMedia?: { type: "image" | "video"; url: string } }>;
  isSubmitting?: boolean;
}

export default function TestimonialForm({ onSubmit, initialData, isSubmitting = false }: TestimonialFormProps) {
  const [formData, setFormData] = useState<TestimonialFormData & { existingProfilePicture?: string; existingPropertyMedia?: { type: "image" | "video"; url: string } }>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    clientName: initialData?.clientName || "",
    profilePicture: initialData?.profilePicture,
    propertyMedia: initialData?.propertyMedia,
    existingProfilePicture: initialData?.existingProfilePicture,
    existingPropertyMedia: initialData?.existingPropertyMedia,
  });

  // Update form data when initialData changes (for async loading in edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        clientName: initialData.clientName || "",
        profilePicture: initialData.profilePicture,
        propertyMedia: initialData.propertyMedia,
        existingProfilePicture: initialData.existingProfilePicture,
        existingPropertyMedia: initialData.existingPropertyMedia,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        profilePicture: e.target.files[0],
        existingProfilePicture: undefined,
      });
    }
  };

  const handlePropertyMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const type = file.type.startsWith("video/") ? "video" : "image";
      setFormData({
        ...formData,
        propertyMedia: {
          type,
          file,
        },
        existingPropertyMedia: undefined,
      });
    }
  };

  const removeProfilePicture = () => {
    setFormData({
      ...formData,
      profilePicture: undefined,
      existingProfilePicture: undefined,
    });
  };

  const removePropertyMedia = () => {
    setFormData({
      ...formData,
      propertyMedia: undefined,
      existingPropertyMedia: undefined,
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
            placeholder="Enter testimonial title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Client Name *
          </label>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter client name"
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
            placeholder="Enter testimonial description"
          />
        </div>
      </div>

      {/* Profile Picture */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Picture</h2>

        {/* Existing Profile Picture */}
        {formData.existingProfilePicture && !formData.profilePicture && (
          <div className="relative inline-block">
            <img
              src={formData.existingProfilePicture}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full border border-gray-300 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={removeProfilePicture}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* New Profile Picture Preview */}
        {formData.profilePicture && (
          <div className="relative inline-block">
            <img
              src={URL.createObjectURL(formData.profilePicture)}
              alt="Profile preview"
              className="w-32 h-32 object-cover rounded-full border border-gray-300 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={removeProfilePicture}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Profile Picture */}
        {!formData.profilePicture && !formData.existingProfilePicture && (
          <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full cursor-pointer hover:border-blue-500 transition-colors">
            <Upload className="w-6 h-6 text-gray-400 mb-2" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Add Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Property Media */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Property Media</h2>

        {/* Existing Property Media */}
        {formData.existingPropertyMedia && !formData.propertyMedia && (
          <div className="relative">
            {formData.existingPropertyMedia.type === "image" ? (
              <img
                src={formData.existingPropertyMedia.url}
                alt="Property media"
                className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
              />
            ) : (
              <video
                src={formData.existingPropertyMedia.url}
                controls
                className="w-full max-w-md h-64 rounded-lg border border-gray-300 dark:border-gray-600"
              />
            )}
            <button
              type="button"
              onClick={removePropertyMedia}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* New Property Media Preview */}
        {formData.propertyMedia && (
          <div className="relative">
            {formData.propertyMedia.type === "image" ? (
              <img
                src={URL.createObjectURL(formData.propertyMedia.file)}
                alt="Property media preview"
                className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
              />
            ) : (
              <video
                src={URL.createObjectURL(formData.propertyMedia.file)}
                controls
                className="w-full max-w-md h-64 rounded-lg border border-gray-300 dark:border-gray-600"
              />
            )}
            <button
              type="button"
              onClick={removePropertyMedia}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Property Media */}
        {!formData.propertyMedia && !formData.existingPropertyMedia && (
          <label className="flex flex-col items-center justify-center w-full max-w-md h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Add Image or Video</span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handlePropertyMediaChange}
              className="hidden"
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
          {isSubmitting ? "Saving..." : "Save Testimonial"}
        </button>
      </div>
    </form>
  );
}

