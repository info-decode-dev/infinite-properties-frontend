"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Building2, MapPin, Calendar, Tag, Star, Phone, Mail, Globe } from "lucide-react";
import Link from "next/link";
import { Property } from "@/types/property";
import apiClient from "@/lib/api";
import LocationMap from "@/components/LocationMap";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.get(`/api/properties/${propertyId}`);
      
      if (response.data.success) {
        const propertyData = response.data.data;
        setProperty({
          id: propertyData.id,
          title: propertyData.title,
          description: propertyData.description,
          images: propertyData.images || [],
          actualPrice: parseFloat(propertyData.actualPrice),
          offerPrice: propertyData.offerPrice ? parseFloat(propertyData.offerPrice) : undefined,
          location: propertyData.location || {
            exactLocation: "",
            city: "",
            state: "",
            country: "",
            latitude: propertyData.location?.latitude,
            longitude: propertyData.location?.longitude,
          },
          bhkType: propertyData.bhkType,
          constructionStatus: propertyData.constructionStatus,
          tags: propertyData.tags || [],
          amenities: propertyData.amenities || [],
          developerInfo: propertyData.developerInfo || {
            name: "",
            email: "",
            phone: "",
            website: "",
            description: "",
          },
          createdAt: propertyData.createdAt,
          updatedAt: propertyData.updatedAt,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch property");
      console.error("Error fetching property:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await apiClient.delete(`/api/properties/${propertyId}`);
      
      if (response.data.success) {
        router.push("/admin/properties");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to delete property";
      alert(errorMessage);
      console.error("Error deleting property:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "N/A";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "Property not found"}
          </p>
          <Link
            href="/admin/properties"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
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
        <div className="flex gap-2">
          <Link
            href={`/admin/properties/${propertyId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Images Gallery */}
        {property.images.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Property Images</h2>
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${property.images[selectedImageIndex]}`}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-property.jpg';
                  }}
                />
              </div>
              {/* Thumbnail Grid */}
              {property.images.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {property.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${img}`}
                        alt={`${property.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{property.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{property.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{property.offerPrice?.toLocaleString('en-IN') || property.actualPrice.toLocaleString('en-IN')}
                </div>
                {property.offerPrice && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 line-through mt-1">
                    ₹{property.actualPrice.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
              {property.propertyType === "Plot" ? (
                <>
                  {property.landType && (
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Land Type</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{property.landType}</div>
                    </div>
                  )}
                  {property.plotSize && property.plotSizeUnit && (
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Plot Size</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {property.plotSize} {property.plotSizeUnit}
                      </div>
                    </div>
                  )}
                  {property.ownership && (
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ownership</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{property.ownership}</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {property.bhkType && (
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">BHK Type</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{property.bhkType}</div>
                    </div>
                  )}
                  {property.constructionStatus && (
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Construction Status</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{property.constructionStatus}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Exact Location</div>
                <div className="text-gray-900 dark:text-white">{property.location.exactLocation}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">City</div>
                <div className="text-gray-900 dark:text-white">{property.location.city}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">State</div>
                <div className="text-gray-900 dark:text-white">{property.location.state}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Country</div>
                <div className="text-gray-900 dark:text-white">{property.location.country}</div>
              </div>
            </div>
            
            {/* Map */}
            {(property.location.latitude && property.location.longitude) && (
              <div className="mt-4">
                <LocationMap
                  latitude={property.location.latitude}
                  longitude={property.location.longitude}
                  onLocationChange={() => {}}
                  height="400px"
                  address={property.location.exactLocation}
                  city={property.location.city}
                  state={property.location.state}
                />
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {property.tags.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {property.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Amenities */}
        {property.amenities.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Amenities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {property.amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  {amenity.icon && (
                    <span className="text-lg">{amenity.icon}</span>
                  )}
                  <span className="text-sm text-gray-900 dark:text-white">{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Developer Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Developer Information</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Developer Name</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{property.developerInfo.name}</div>
            </div>
            {property.developerInfo.description && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</div>
                <div className="text-gray-900 dark:text-white">{property.developerInfo.description}</div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {property.developerInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${property.developerInfo.email}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {property.developerInfo.email}
                  </a>
                </div>
              )}
              {property.developerInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a
                    href={`tel:${property.developerInfo.phone}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {property.developerInfo.phone}
                  </a>
                </div>
              )}
              {property.developerInfo.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a
                    href={property.developerInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Metadata
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created At</div>
              <div className="text-gray-900 dark:text-white">{formatDate(property.createdAt)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Updated</div>
              <div className="text-gray-900 dark:text-white">{formatDate(property.updatedAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
