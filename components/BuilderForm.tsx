"use client";

import { useState, useEffect } from "react";
import { X, Upload, Phone, Mail, Globe, FileText, User, Image as ImageIcon } from "lucide-react";
import { BuilderFormData } from "@/types/builder";
import apiClient from "@/lib/api";

interface BuilderFormProps {
  onSubmit: (data: FormData) => void;
  initialData?: Partial<BuilderFormData & { id?: string }>;
  isSubmitting?: boolean;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function BuilderForm({ onSubmit, initialData, isSubmitting = false }: BuilderFormProps) {
  const [formData, setFormData] = useState<BuilderFormData>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    website: initialData?.website || "",
    description: initialData?.description || "",
    profilePicture: initialData?.profilePicture || "",
  });
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [phoneEnabled, setPhoneEnabled] = useState(!!initialData?.phone);
  const [imageError, setImageError] = useState<string>("");

  useEffect(() => {
    if (initialData?.profilePicture) {
      const imageUrl = initialData.profilePicture.startsWith("http")
        ? initialData.profilePicture
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${initialData.profilePicture}`;
      setProfilePicturePreview(imageUrl);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImageError("");

    // Validate image size if new file is selected
    if (profilePictureFile && profilePictureFile.size > MAX_IMAGE_SIZE) {
      setImageError("Profile picture must be less than 5MB");
      return;
    }

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("name", formData.name);
    if (formData.email) formDataToSubmit.append("email", formData.email);
    if (phoneEnabled && formData.phone) {
      // Remove +91 if already present, we'll add it on backend
      const cleanedPhone = formData.phone.replace(/^\+91\s*/, "").trim();
      formDataToSubmit.append("phone", cleanedPhone);
    } else {
      formDataToSubmit.append("phone", "");
    }
    if (formData.website) formDataToSubmit.append("website", formData.website);
    if (formData.description) formDataToSubmit.append("description", formData.description);
    if (profilePictureFile) {
      formDataToSubmit.append("profilePicture", profilePictureFile);
    }

    onSubmit(formDataToSubmit);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size
      if (file.size > MAX_IMAGE_SIZE) {
        setImageError("Profile picture must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setImageError("Please select an image file");
        return;
      }

      setImageError("");
      setProfilePictureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfilePictureFile(null);
    setProfilePicturePreview(initialData?.profilePicture ? 
      (initialData.profilePicture.startsWith("http")
        ? initialData.profilePicture
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${initialData.profilePicture}`)
      : null
    );
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove any non-digit characters except +91
    value = value.replace(/[^\d]/g, "");
    // Limit to 10 digits
    if (value.length > 10) value = value.slice(0, 10);
    setFormData({ ...formData, phone: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Builder Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Developer Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter developer/builder name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="developer@example.com"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              id="enablePhone"
              checked={phoneEnabled}
              onChange={(e) => {
                setPhoneEnabled(e.target.checked);
                if (!e.target.checked) {
                  setFormData({ ...formData, phone: "" });
                }
              }}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="enablePhone" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Add Phone Number
            </label>
          </div>
          {phoneEnabled && (
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <div className="flex items-center">
                <span className="absolute left-10 text-gray-600 dark:text-gray-400 font-medium">+91</span>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={handlePhoneChange}
                  className="w-full pl-16 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter 10-digit Indian phone number (country code +91 will be added automatically)
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              value={formData.website || ""}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter builder description..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Profile Picture
          </label>
          <div className="space-y-4">
            {profilePicturePreview && (
              <div className="relative inline-block">
                <img
                  src={profilePicturePreview}
                  alt="Profile preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-900/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {imageError && (
              <p className="text-sm text-red-600 dark:text-red-400">{imageError}</p>
            )}
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
          {isSubmitting ? "Saving..." : initialData?.id ? "Update Builder" : "Save Builder"}
        </button>
      </div>
    </form>
  );
}
