"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Testimonial } from "@/types/testimonial";

export default function TestimonialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testimonialId = params.id as string;

  // TODO: Fetch testimonial data from API
  const testimonial: Testimonial | null = null;

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!testimonial) {
    return (
      <div className="p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">Testimonial not found</p>
          <Link
            href="/admin/testimonials"
            className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Testimonials
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex gap-2">
          <Link
            href={`/admin/testimonials/${testimonialId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this testimonial?")) {
                // TODO: Implement delete
                router.push("/admin/testimonials");
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
        {/* Property Media */}
        {testimonial.propertyMedia && (
          <div className="mb-6">
            {testimonial.propertyMedia.type === "image" ? (
              <img
                src={testimonial.propertyMedia.url}
                alt="Property"
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <video
                src={testimonial.propertyMedia.url}
                controls
                className="w-full h-96 object-cover rounded-lg"
              />
            )}
          </div>
        )}

        {/* Client Info */}
        <div className="flex items-center gap-4 mb-6">
          {testimonial.profilePicture ? (
            <img
              src={testimonial.profilePicture}
              alt={testimonial.clientName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xl">
              {getInitials(testimonial.clientName)}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {testimonial.clientName}
            </h2>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {testimonial.title}
        </h1>

        {/* Description */}
        {testimonial.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {testimonial.description}
          </p>
        )}
      </div>
    </div>
  );
}

