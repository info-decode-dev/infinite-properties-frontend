"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Search, Building2 } from "lucide-react";
import { Property } from "@/types/property";
import apiClient from "@/lib/api";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.get("/api/properties");
      if (response.data.success) {
        // Transform API response to match Property type
        const transformedProperties = response.data.data.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          images: p.images || [],
          actualPrice: p.actualPrice,
          offerPrice: p.offerPrice,
          location: p.location || {
            exactLocation: "",
            city: "",
            state: "",
            country: "",
          },
          bhkType: p.bhkType,
          constructionStatus: p.constructionStatus,
          tags: p.tags || [],
          amenities: p.amenities || [],
          developerInfo: p.developerInfo || {
            name: "",
          },
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));
        setProperties(transformedProperties);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch properties");
      console.error("Error fetching properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProperties = properties.filter((property) =>
    property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.location.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await apiClient.delete(`/api/properties/${id}`);
      
      if (response.data.success) {
        // Refresh the properties list after successful deletion
        await fetchProperties();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to delete property";
      alert(errorMessage);
      console.error("Error deleting property:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Check if property is new (created within 2 days)
  const isNewProperty = (createdAt: Date | string | undefined): boolean => {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - createdDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 2;
  };

  // Format date for display
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "N/A";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Properties
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage all your property listings
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Add New Property</span>
          <span className="sm:hidden">Add New</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search properties by title or city..."
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
          <p className="text-gray-600 dark:text-gray-400">Loading properties...</p>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No properties found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery
              ? "Try adjusting your search criteria"
              : "Get started by adding your first property"}
          </p>
          {!searchQuery && (
            <Link
              href="/admin/properties/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add New Property
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      BHK / Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProperties.map((property) => (
                    <tr
                      key={property.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 shrink-0">
                            {property.images.length > 0 ? (
                              <>
                                <img
                                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${property.images[0]}`}
                                  alt={property.title}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    const placeholder = (e.target as HTMLImageElement).parentElement?.querySelector('.image-placeholder') as HTMLElement;
                                    if (placeholder) placeholder.style.display = 'flex';
                                  }}
                                />
                                <div className="image-placeholder hidden absolute inset-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg items-center justify-center">
                                  <Building2 className="w-8 h-8 text-gray-400" />
                                </div>
                              </>
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            {isNewProperty(property.createdAt) && (
                              <div className="absolute -top-1 -left-1 z-10">
                                <span className="relative inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-md">
                                  <span className="relative z-10">New</span>
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {property.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {property.description.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {property.location.city}, {property.location.state}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {property.location.country}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ₹{property.offerPrice?.toLocaleString('en-IN') || property.actualPrice.toLocaleString('en-IN')}
                        </div>
                        {property.offerPrice && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                            ₹{property.actualPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {property.propertyType === "Plot" ? (
                          <>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {property.landType || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {property.ownership || "N/A"}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {property.bhkType || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {property.constructionStatus || "N/A"}
                            </div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {property.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {property.tags.length > 2 && (
                            <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                              +{property.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(property.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/properties/${property.id}`}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/admin/properties/${property.id}/edit`}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(property.id)}
                            disabled={deletingId === property.id}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {deletingId === property.id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex gap-4 mb-4">
                  <div className="relative w-20 h-20 shrink-0">
                    {property.images.length > 0 ? (
                      <>
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${property.images[0]}`}
                          alt={property.title}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const placeholder = (e.target as HTMLImageElement).parentElement?.querySelector('.image-placeholder') as HTMLElement;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                        <div className="image-placeholder hidden absolute inset-0 w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg items-center justify-center">
                          <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                      </>
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {isNewProperty(property.createdAt) && (
                      <div className="absolute -top-1 -left-1 z-10">
                        <span className="relative inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-md">
                          New
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {property.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {property.description.substring(0, 60)}...
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Location:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {property.location.city}, {property.location.state}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Price:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ₹{property.offerPrice?.toLocaleString('en-IN') || property.actualPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {property.propertyType === "Plot" ? (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Land Type:</span>
                        <span className="text-gray-900 dark:text-white">{property.landType || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Ownership:</span>
                        <span className="text-gray-900 dark:text-white">{property.ownership || "N/A"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">BHK:</span>
                        <span className="text-gray-900 dark:text-white">{property.bhkType || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <span className="text-gray-900 dark:text-white">{property.constructionStatus || "N/A"}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="text-gray-900 dark:text-white">{formatDate(property.createdAt)}</span>
                  </div>
                  {property.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {property.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {property.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                          +{property.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href={`/admin/properties/${property.id}`}
                    className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="View"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <Link
                    href={`/admin/properties/${property.id}/edit`}
                    className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(property.id)}
                    disabled={deletingId === property.id}
                    className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    {deletingId === property.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

