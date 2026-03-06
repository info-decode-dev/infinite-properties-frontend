"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
} from "lucide-react";
import { Enquiry } from "@/types/enquiry";
import apiClient from "@/lib/api";
import LocationMap from "@/components/LocationMap";

export default function EnquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const enquiryId = params.id as string;

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchEnquiry();
  }, [enquiryId]);

  const fetchEnquiry = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.get(`/api/enquiries/${enquiryId}`);

      if (response.data.success) {
        setEnquiry(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch enquiry");
      console.error("Error fetching enquiry:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      setIsUpdating(true);
      const response = await apiClient.put(`/api/enquiries/${enquiryId}/status`, { status });
      if (response.data.success) {
        setEnquiry(response.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this enquiry? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await apiClient.delete(`/api/enquiries/${enquiryId}`);
      if (response.data.success) {
        router.push("/admin/enquiries");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete enquiry");
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "contacted":
        return <CheckCircle className="w-5 h-5" />;
      case "closed":
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "contacted":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "closed":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading enquiry details...</p>
        </div>
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="p-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || "Enquiry not found"}</p>
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Enquiries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <div className="space-y-6">
        {/* User Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            User Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {enquiry.userName}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a
                  href={`mailto:${enquiry.userEmail}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {enquiry.userEmail}
                </a>
              </div>
            </div>
            {enquiry.userPhone && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a
                    href={`tel:${enquiry.userPhone}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {enquiry.userPhone}
                  </a>
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Enquiry Date</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{formatDate(enquiry.createdAt)}</span>
              </div>
            </div>
          </div>

          {enquiry.message && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Message
              </div>
              <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                {enquiry.message}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Status</div>
            <div className="flex items-center gap-4">
              <select
                value={enquiry.status}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={isUpdating}
                className={`px-4 py-2 rounded-lg font-medium border ${getStatusColor(
                  enquiry.status
                )} focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
              {isUpdating && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
            </div>
          </div>
        </div>

        {/* Property Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Enquired Property
          </h2>

          <div className="space-y-6">
            {/* Property Image */}
            {enquiry.property.images && enquiry.property.images.length > 0 && (
              <div>
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${enquiry.property.images[0]}`}
                  alt={enquiry.property.title}
                  className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            )}

            {/* Property Details */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {enquiry.property.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {enquiry.property.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{enquiry.property.offerPrice?.toLocaleString('en-IN') || enquiry.property.actualPrice.toLocaleString('en-IN')}
                  </div>
                  {enquiry.property.offerPrice && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-through mt-1">
                      ₹{enquiry.property.actualPrice.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
                {enquiry.property.propertyType === "Plot" ? (
                  <>
                    {enquiry.property.landType && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Land Type</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {enquiry.property.landType}
                        </div>
                      </div>
                    )}
                    {enquiry.property.plotSize && enquiry.property.plotSizeUnit && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Plot Size</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {enquiry.property.plotSize} {enquiry.property.plotSizeUnit}
                        </div>
                      </div>
                    )}
                    {enquiry.property.ownership && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ownership</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {enquiry.property.ownership}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  enquiry.property.bhkType && (
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">BHK Type</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {enquiry.property.bhkType}
                      </div>
                    </div>
                  )
                )}
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Construction Status</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {enquiry.property.constructionStatus}
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Exact Location</div>
                  <div className="text-gray-900 dark:text-white">{enquiry.property.location.exactLocation}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">City</div>
                  <div className="text-gray-900 dark:text-white">{enquiry.property.location.city}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">State</div>
                  <div className="text-gray-900 dark:text-white">{enquiry.property.location.state}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Country</div>
                  <div className="text-gray-900 dark:text-white">{enquiry.property.location.country}</div>
                </div>
              </div>

              {/* Map */}
              {enquiry.property.location.latitude && enquiry.property.location.longitude && (
                <div className="mt-4">
                  <LocationMap
                    latitude={enquiry.property.location.latitude}
                    longitude={enquiry.property.location.longitude}
                    onLocationChange={() => {}}
                    height="400px"
                    address={enquiry.property.location.exactLocation}
                    city={enquiry.property.location.city}
                    state={enquiry.property.location.state}
                  />
                </div>
              )}
            </div>

            {/* View Property Link */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/admin/properties/${enquiry.property.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Eye className="w-5 h-5" />
                View Full Property Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

