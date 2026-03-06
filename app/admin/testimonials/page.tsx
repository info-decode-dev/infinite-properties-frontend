"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Search, MessageSquare, Quote, Star } from "lucide-react";
import { Testimonial } from "@/types/testimonial";
import apiClient from "@/lib/api";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.get("/api/testimonials");
      if (response.data.success) {
        // Transform API response to match Testimonial type
        const transformedTestimonials = response.data.data.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          clientName: t.clientName,
          profilePicture: t.profilePicture,
          propertyMedia: t.propertyMedia ? {
            type: t.propertyMedia.type,
            url: t.propertyMedia.url,
          } : undefined,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        }));
        setTestimonials(transformedTestimonials);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch testimonials");
      console.error("Error fetching testimonials:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTestimonials = testimonials.filter(
    (testimonial) =>
      testimonial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await apiClient.delete(`/api/testimonials/${id}`);
      
      if (response.data.success) {
        // Refresh the testimonials list after successful deletion
        await fetchTestimonials();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to delete testimonial";
      alert(errorMessage);
      console.error("Error deleting testimonial:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Testimonials
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage client testimonials and reviews
          </p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Add New Testimonial</span>
          <span className="sm:hidden">Add New</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search testimonials by title or client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading testimonials...</p>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No testimonials found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery
              ? "Try adjusting your search criteria"
              : "Get started by adding your first testimonial"}
          </p>
          {!searchQuery && (
            <Link
              href="/admin/testimonials/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add New Testimonial
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative"
            >
              {/* Property Media with Overlay */}
              {testimonial.propertyMedia && (
                <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
                  {testimonial.propertyMedia.type === "image" ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${testimonial.propertyMedia.url}`}
                      alt="Property"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <video
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${testimonial.propertyMedia.url}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      controls
                      muted
                    />
                  )}
                  {/* Quote Icon Overlay */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30">
                      <Quote className="w-6 h-6 text-white" fill="white" />
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 relative">
                {/* Quote Icon if no media */}
                {!testimonial.propertyMedia && (
                  <div className="absolute top-6 right-6">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-3 shadow-lg">
                      <Quote className="w-6 h-6 text-white" fill="white" />
                    </div>
                  </div>
                )}

                {/* Client Info with Premium Styling */}
                <div className="flex items-center gap-4 mb-5">
                  {testimonial.profilePicture ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur opacity-50"></div>
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${testimonial.profilePicture}`}
                        alt={testimonial.clientName}
                        className="relative w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur opacity-50"></div>
                      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white dark:border-gray-800">
                        {getInitials(testimonial.clientName)}
                      </div>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                      {testimonial.clientName}
                    </h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Title with Premium Typography */}
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight line-clamp-2">
                  {testimonial.title}
                </h4>

                {/* Description with Better Styling */}
                {testimonial.description && (
                  <div className="relative mb-5">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                      {testimonial.description}
                    </p>
                    <div className="absolute bottom-0 right-0 w-20 h-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent"></div>
                  </div>
                )}

                {/* Actions with Premium Design */}
                <div className="flex items-center justify-end gap-2 pt-5 border-t border-gray-100 dark:border-gray-700/50">
                  <Link
                    href={`/admin/testimonials/${testimonial.id}`}
                    className="p-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                    title="View"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <Link
                    href={`/admin/testimonials/${testimonial.id}/edit`}
                    className="p-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    disabled={deletingId === testimonial.id}
                    className="p-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    {deletingId === testimonial.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Premium Accent Border */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

