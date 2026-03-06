"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, Save, Eye } from "lucide-react";
import { AboutUs } from "@/types/about";
import apiClient from "@/lib/api";

export default function AboutUsPage() {
  // Note: This page uses AboutUsForm component which should handle its own responsiveness
  const [aboutUs, setAboutUs] = useState<AboutUs | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch About Us data on mount
  useEffect(() => {
    fetchAboutUs();
  }, []);

  const fetchAboutUs = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.get("/api/about-us");
      if (response.data.success && response.data.data) {
        setAboutUs(response.data.data);
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || "Failed to fetch About Us data");
        console.error("Error fetching About Us:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      setIsSaving(true);
      setError("");

      // Create FormData for file uploads
      const formData = new FormData();

      // Append text fields
      formData.append("companyName", data.companyName);
      if (data.tagline) formData.append("tagline", data.tagline);
      if (data.mission) formData.append("mission", data.mission);
      if (data.vision) formData.append("vision", data.vision);
      if (data.story) formData.append("story", data.story);

      // Append arrays as JSON (always send, even if empty)
      formData.append("values", JSON.stringify(data.values || []));
      formData.append("statistics", JSON.stringify(data.statistics || []));
      formData.append("achievements", JSON.stringify(data.achievements || []));
      
      // Process team members - extract image files and prepare data
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const teamMembersData = (data.teamMembers || []).map((member: any, index: number) => {
        const { imageFile, ...memberData } = member;
        // If there's a new image file, don't include the old image URL (backend will use uploaded file)
        if (imageFile) {
          // New file uploaded - remove the temporary preview URL
          delete memberData.image;
        } else if (memberData.image) {
          // Preserve existing image URL, but convert full URL back to relative path if needed
          if (typeof memberData.image === 'string') {
            if (memberData.image.startsWith('blob:')) {
              // Temporary blob URL from preview, remove it
              delete memberData.image;
            } else if (memberData.image.startsWith(apiUrl)) {
              // Full URL with API prefix, convert back to relative path
              memberData.image = memberData.image.replace(apiUrl, '');
            }
            // Otherwise keep as is (already a relative path or external URL)
          }
        }
        return memberData;
      });
      formData.append("teamMembers", JSON.stringify(teamMembersData));
      
      // Append team member image files with unique field names
      (data.teamMembers || []).forEach((member: any, index: number) => {
        if (member.imageFile && member.imageFile instanceof File) {
          formData.append(`teamMemberImage_${index}`, member.imageFile);
        }
      });
      if (data.contactInfo) {
        formData.append("contactInfo", JSON.stringify(data.contactInfo));
      } else {
        // Send empty object if no contact info
        formData.append("contactInfo", JSON.stringify({}));
      }

      // Append image files
      if (data.images && Array.isArray(data.images)) {
        data.images.forEach((file: File) => {
          formData.append("images", file);
        });
      }

      // Include existing images that weren't removed
      if (data.existingImages && Array.isArray(data.existingImages)) {
        formData.append("existingImages", JSON.stringify(data.existingImages));
      }

      // Use POST for create, PUT for update
      const method = aboutUs ? "put" : "post";
      const response = await apiClient[method]("/api/about-us", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setAboutUs(response.data.data);
        setIsEditing(false);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to save About Us data";
      setError(message);
      console.error("Error saving About Us:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            About Us Section
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your company's About Us page content
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Edit className="w-5 h-5" />
              {aboutUs ? "Edit Content" : "Create About Us"}
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              <Eye className="w-5 h-5" />
              Preview Mode
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      ) : !aboutUs && !isEditing ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No About Us content yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by creating your About Us page content
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Edit className="w-5 h-5" />
            Create About Us
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {isEditing ? (
            <AboutUsForm
              initialData={aboutUs || undefined}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
              isSubmitting={isSaving}
            />
          ) : (
            aboutUs && <AboutUsPreview aboutUs={aboutUs} />
          )}
        </div>
      )}
    </div>
  );
}

// Preview Component
function AboutUsPreview({ aboutUs }: { aboutUs: AboutUs }) {
  return (
    <div className="space-y-8">
      {/* Company Name & Tagline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {aboutUs.companyName}
        </h2>
        {aboutUs.tagline && (
          <p className="text-xl text-gray-600 dark:text-gray-400">{aboutUs.tagline}</p>
        )}
      </div>

      {/* Images */}
      {aboutUs.images && aboutUs.images.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aboutUs.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`About Us ${index + 1}`}
                className="w-full h-64 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Mission & Vision */}
      {(aboutUs.mission || aboutUs.vision) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aboutUs.mission && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {aboutUs.mission}
              </p>
            </div>
          )}
          {aboutUs.vision && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Our Vision
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {aboutUs.vision}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Story */}
      {aboutUs.story && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Our Story
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
            {aboutUs.story}
          </p>
        </div>
      )}

      {/* Values */}
      {aboutUs.values && aboutUs.values.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Our Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aboutUs.values.map((value, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <p className="font-medium text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics/Counts */}
      {aboutUs.statistics && aboutUs.statistics.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Our Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {aboutUs.statistics.map((stat) => (
              <div
                key={stat.id}
                className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.prefix}
                  {stat.value}
                  {stat.suffix}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {aboutUs.achievements && aboutUs.achievements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Our Achievements
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {aboutUs.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {achievement.value}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {achievement.title}
                </div>
                {achievement.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {achievement.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Members */}
      {aboutUs.teamMembers && aboutUs.teamMembers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Our Team
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aboutUs.teamMembers.map((member) => {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
              const getImageUrl = (imagePath?: string) => {
                if (!imagePath) return null;
                if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
                return `${apiUrl}${imagePath}`;
              };
              const imageUrl = getImageUrl(member.image);
              
              return (
                <div
                  key={member.id}
                  className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-gray-200 dark:border-gray-600"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {member.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {member.position}
                  </p>
                  {member.bio && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.bio}</p>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                    >
                      {member.email}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contact Info */}
      {aboutUs.contactInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Contact Us
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aboutUs.contactInfo.address && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Address</h4>
                <p className="text-gray-600 dark:text-gray-400">{aboutUs.contactInfo.address}</p>
              </div>
            )}
            {aboutUs.contactInfo.phone && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Phone</h4>
                <p className="text-gray-600 dark:text-gray-400">{aboutUs.contactInfo.phone}</p>
              </div>
            )}
            {aboutUs.contactInfo.email && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Email</h4>
                <p className="text-gray-600 dark:text-gray-400">{aboutUs.contactInfo.email}</p>
              </div>
            )}
            {aboutUs.contactInfo.website && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Website</h4>
                <a
                  href={aboutUs.contactInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {aboutUs.contactInfo.website}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Form Component
function AboutUsForm({
  initialData,
  onSave,
  onCancel,
  isSubmitting = false,
}: {
  initialData?: AboutUs;
  onSave: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  // Helper to format image URLs for display
  const formatImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
      return url;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${apiUrl}${url}`;
  };

  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || "",
    tagline: initialData?.tagline || "",
    mission: initialData?.mission || "",
    vision: initialData?.vision || "",
    story: initialData?.story || "",
    values: initialData?.values || [],
    statistics: initialData?.statistics || [],
    achievements: initialData?.achievements || [],
    teamMembers: (initialData?.teamMembers || []).map((member) => ({
      ...member,
      image: formatImageUrl(member.image), // Format image URLs for display
    })),
    contactInfo: initialData?.contactInfo || {},
    images: [] as File[],
  });

  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);

  const [newValue, setNewValue] = useState("");
  const [newStatistic, setNewStatistic] = useState({
    label: "",
    value: "",
    prefix: "",
    suffix: "",
  });
  const [newAchievement, setNewAchievement] = useState({ title: "", value: "", description: "" });
  const [newTeamMember, setNewTeamMember] = useState({
    name: "",
    position: "",
    bio: "",
    email: "",
    image: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, existingImages });
  };

  const addValue = () => {
    if (newValue.trim()) {
      setFormData({
        ...formData,
        values: [...formData.values, newValue.trim()],
      });
      setNewValue("");
    }
  };

  const removeValue = (index: number) => {
    setFormData({
      ...formData,
      values: formData.values.filter((_, i) => i !== index),
    });
  };

  const addStatistic = () => {
    if (newStatistic.label && newStatistic.value) {
      setFormData({
        ...formData,
        statistics: [
          ...formData.statistics,
          {
            id: Date.now().toString(),
            ...newStatistic,
          },
        ],
      });
      setNewStatistic({ label: "", value: "", prefix: "", suffix: "" });
    }
  };

  const removeStatistic = (id: string) => {
    setFormData({
      ...formData,
      statistics: formData.statistics.filter((s) => s.id !== id),
    });
  };

  const addAchievement = () => {
    if (newAchievement.title && newAchievement.value) {
      setFormData({
        ...formData,
        achievements: [
          ...formData.achievements,
          {
            id: Date.now().toString(),
            ...newAchievement,
          },
        ],
      });
      setNewAchievement({ title: "", value: "", description: "" });
    }
  };

  const removeAchievement = (id: string) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((a) => a.id !== id),
    });
  };

  const addTeamMember = () => {
    if (newTeamMember.name && newTeamMember.position) {
      setFormData({
        ...formData,
        teamMembers: [
          ...formData.teamMembers,
          {
            id: Date.now().toString(),
            name: newTeamMember.name,
            position: newTeamMember.position,
            bio: newTeamMember.bio,
            email: newTeamMember.email,
            image: newTeamMember.image ? URL.createObjectURL(newTeamMember.image) : undefined,
            imageFile: newTeamMember.image, // Store file separately for upload
          },
        ],
      });
      setNewTeamMember({ name: "", position: "", bio: "", email: "", image: null });
    }
  };

  const removeTeamMember = (id: string) => {
    setFormData({
      ...formData,
      teamMembers: formData.teamMembers.filter((m) => m.id !== id),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tagline
          </label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your company tagline"
          />
        </div>
      </div>

      {/* Images */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Images</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload images to showcase your company. You can select multiple images at once.
          </p>
        </div>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setFormData({ ...formData, images: [...formData.images, ...files] });
            }}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF up to 10MB each
            </span>
          </label>
        </div>
        {(existingImages.length > 0 || formData.images.length > 0) && (
          <div className="space-y-4">
            {existingImages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Existing Images
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((imgUrl, i) => {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                    const fullUrl = imgUrl.startsWith("http") ? imgUrl : `${apiUrl}${imgUrl}`;
                    return (
                      <div key={`existing-${i}`} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img
                            src={fullUrl}
                            alt={`Existing ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExistingImages(existingImages.filter((_, idx) => idx !== i))
                          }
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {formData.images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  New Images to Upload
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.images.map((img, i) => (
                    <div key={`new-${i}`} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Preview ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            images: formData.images.filter((_, idx) => idx !== i),
                          })
                        }
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                        {img.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Mission</h2>
          <textarea
            value={formData.mission}
            onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your company mission"
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Vision</h2>
          <textarea
            value={formData.vision}
            onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your company vision"
          />
        </div>
      </div>

      {/* Story */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Our Story</h2>
        <textarea
          value={formData.story}
          onChange={(e) => setFormData({ ...formData, story: e.target.value })}
          rows={10}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell your company's story"
        />
      </div>

      {/* Values */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Values</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addValue();
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Add a value"
          />
          <button
            type="button"
            onClick={addValue}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.values.map((value, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
            >
              {value}
              <button
                type="button"
                onClick={() => removeValue(i)}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Statistics/Counts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Statistics & Counts
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add key statistics like successful clients, years of experience, sqft completed, etc.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            value={newStatistic.label}
            onChange={(e) => setNewStatistic({ ...newStatistic, label: e.target.value })}
            placeholder="Label (e.g., Successful Clients)"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            value={newStatistic.value}
            onChange={(e) => setNewStatistic({ ...newStatistic, value: e.target.value })}
            placeholder="Value (e.g., 500)"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            value={newStatistic.prefix}
            onChange={(e) => setNewStatistic({ ...newStatistic, prefix: e.target.value })}
            placeholder="Prefix (e.g., $)"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            value={newStatistic.suffix}
            onChange={(e) => setNewStatistic({ ...newStatistic, suffix: e.target.value })}
            placeholder="Suffix (e.g., +, years, sqft)"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            type="button"
            onClick={addStatistic}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Statistic
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {formData.statistics.map((stat) => (
            <div
              key={stat.id}
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800 relative"
            >
              <button
                type="button"
                onClick={() => removeStatistic(stat.id)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
              >
                ×
              </button>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {stat.prefix}
                {stat.value}
                {stat.suffix}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        {formData.statistics.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No statistics added yet. Add your first statistic above.
          </p>
        )}
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Achievements</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add your company's achievements and awards
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={newAchievement.title}
            onChange={(e) =>
              setNewAchievement({ ...newAchievement, title: e.target.value })
            }
            placeholder="Title (e.g., Best Developer Award)"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={newAchievement.value}
            onChange={(e) =>
              setNewAchievement({ ...newAchievement, value: e.target.value })
            }
            placeholder="Value (e.g., 2023)"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={newAchievement.description || ""}
            onChange={(e) =>
              setNewAchievement({ ...newAchievement, description: e.target.value })
            }
            placeholder="Description (optional)"
            rows={1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            type="button"
            onClick={addAchievement}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add Achievement
          </button>
        </div>
        {formData.achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {formData.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800 relative shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  type="button"
                  onClick={() => removeAchievement(achievement.id)}
                  className="absolute top-3 right-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  title="Remove achievement"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {achievement.value}
                </div>
                <div className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {achievement.title}
                </div>
                {achievement.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {achievement.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No achievements added yet. Add your first achievement above.</p>
          </div>
        )}
      </div>

      {/* Team Members */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Team Members</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add your team members with their details
          </p>
        </div>
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newTeamMember.name}
              onChange={(e) =>
                setNewTeamMember({ ...newTeamMember, name: e.target.value })
              }
              placeholder="Full Name *"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newTeamMember.position}
              onChange={(e) =>
                setNewTeamMember({ ...newTeamMember, position: e.target.value })
              }
              placeholder="Position/Title *"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <textarea
            value={newTeamMember.bio}
            onChange={(e) =>
              setNewTeamMember({ ...newTeamMember, bio: e.target.value })
            }
            placeholder="Bio/Description (optional)"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Profile Picture (optional)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewTeamMember({ ...newTeamMember, image: file });
                  }
                }}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300
                  hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
                  cursor-pointer"
              />
              {newTeamMember.image && (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(newTeamMember.image)}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setNewTeamMember({ ...newTeamMember, image: null })}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
          <input
            type="email"
            value={newTeamMember.email}
            onChange={(e) =>
              setNewTeamMember({ ...newTeamMember, email: e.target.value })
            }
            placeholder="Email (optional)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addTeamMember}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add Team Member
          </button>
        </div>
        {formData.teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.teamMembers.map((member) => (
              <div
                key={member.id}
                className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800 relative shadow-sm hover:shadow-md transition-all group"
              >
                <button
                  type="button"
                  onClick={() => removeTeamMember(member.id)}
                  className="absolute top-3 right-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove team member"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800 shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                      {member.name}
                    </h3>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                      {member.position}
                    </p>
                    {member.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-2">
                        {member.bio}
                      </p>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        {member.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No team members added yet. Add your first team member above.</p>
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={formData.contactInfo.address || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, address: e.target.value },
              })
            }
            placeholder="Address"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            type="tel"
            value={formData.contactInfo.phone || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, phone: e.target.value },
              })
            }
            placeholder="Phone"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            type="email"
            value={formData.contactInfo.email || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, email: e.target.value },
              })
            }
            placeholder="Email"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            type="url"
            value={formData.contactInfo.website || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, website: e.target.value },
              })
            }
            placeholder="Website"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save About Us"}
        </button>
      </div>
    </form>
  );
}

