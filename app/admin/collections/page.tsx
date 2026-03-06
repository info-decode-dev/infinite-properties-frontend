"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, Image as ImageIcon, Video, Star, AlertTriangle, CheckCircle, Building2, Layers, Users, Mail, Phone, Globe } from "lucide-react";
import { CuratedCollection, Reel } from "@/types/collection";
import { FeaturedProperty } from "@/types/featured";
import { Builder } from "@/types/builder";
import apiClient from "@/lib/api";

export default function CollectionsPage() {
  const pathname = usePathname();
  const [collections, setCollections] = useState<CuratedCollection[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<FeaturedProperty[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"collections" | "reels" | "featured" | "builders">("collections");
  const [collectionSearch, setCollectionSearch] = useState("");
  const [reelSearch, setReelSearch] = useState("");
  const [featuredSearch, setFeaturedSearch] = useState("");
  const [builderSearch, setBuilderSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingCollectionId, setDeletingCollectionId] = useState<string | null>(null);
  const [deletingReelId, setDeletingReelId] = useState<string | null>(null);
  const [deletingFeaturedId, setDeletingFeaturedId] = useState<string | null>(null);
  const [deletingBuilderId, setDeletingBuilderId] = useState<string | null>(null);
  const [propertyImages, setPropertyImages] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
    // Set active tab based on URL if editing/adding
    if (pathname?.includes("/collection")) {
      setActiveTab("collections");
    } else if (pathname?.includes("/reel")) {
      setActiveTab("reels");
    } else if (pathname?.includes("/featured")) {
      setActiveTab("featured");
    } else if (pathname?.includes("/builder")) {
      setActiveTab("builders");
    }
  }, [pathname]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const [collectionsRes, reelsRes, featuredRes, buildersRes, propertiesRes] = await Promise.all([
        apiClient.get("/api/collections/collections"),
        apiClient.get("/api/collections/reels"),
        apiClient.get("/api/collections/featured"),
        apiClient.get("/api/collections/builders"),
        apiClient.get("/api/properties"),
      ]);

      if (collectionsRes.data.success) {
        setCollections(collectionsRes.data.data);
      }
      if (reelsRes.data.success) {
        setReels(reelsRes.data.data);
      }
      if (featuredRes.data.success) {
        // Transform gallery from array to single media for display
        const transformed = featuredRes.data.data.map((fp: any) => ({
          ...fp,
          media: fp.gallery && fp.gallery.length > 0 ? fp.gallery[0] : undefined,
        }));
        setFeaturedProperties(transformed);
      }
      if (buildersRes.data.success) {
        setBuilders(buildersRes.data.data);
      }
      if (propertiesRes.data.success) {
        setProperties(propertiesRes.data.data);
      }

      // Fetch property images for reels
      if (reelsRes.data.success && propertiesRes.data.success) {
        await fetchPropertyImagesForReels(reelsRes.data.data, propertiesRes.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch property images for reels
  const fetchPropertyImagesForReels = async (reelsData: Reel[], propertiesData: any[] = []) => {
    const imagesMap: Record<string, string> = {};
    
    // Extract unique property IDs from reels
    const propertyIds = new Set<string>();
    reelsData.forEach((reel) => {
      if (reel.actionButtonLink) {
        const propertyId = extractPropertyId(reel.actionButtonLink);
        if (propertyId) {
          propertyIds.add(propertyId);
        }
      }
    });

    if (propertyIds.size === 0) {
      return;
    }

    // Fetch property images in parallel
    const fetchPromises = Array.from(propertyIds).map(async (propertyId) => {
      try {
        // First check if property is already in the properties list
        const existingProperty = propertiesData.find((p) => p.id === propertyId);
        if (existingProperty && existingProperty.images && existingProperty.images.length > 0) {
          const imagePath = existingProperty.images[0];
          const imageUrl = imagePath.startsWith("http")
            ? imagePath
            : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${imagePath}`;
          return { propertyId, imageUrl };
        }

        // If not found, fetch from API
        const response = await apiClient.get(`/api/properties/public/${propertyId}`);
        if (response.data.success && response.data.data) {
          const property = response.data.data;
          if (property.images && property.images.length > 0) {
            const imagePath = property.images[0];
            const imageUrl = imagePath.startsWith("http")
              ? imagePath
              : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${imagePath}`;
            return { propertyId, imageUrl };
          }
        }
      } catch (error) {
        console.error(`Error fetching property ${propertyId}:`, error);
      }
      return null;
    });

    const results = await Promise.all(fetchPromises);
    results.forEach((result) => {
      if (result) {
        imagesMap[result.propertyId] = result.imageUrl;
      }
    });

    setPropertyImages(imagesMap);
  };

  // Helper function to extract property ID from actionButtonLink
  const extractPropertyId = (actionButtonLink: string | undefined): string | null => {
    if (!actionButtonLink) return null;
    const match = actionButtonLink.match(/\/properties\/([^\/]+)/);
    return match ? match[1] : null;
  };

  // Helper function to check if property exists
  const isPropertyValid = (reel: Reel): boolean => {
    if (!reel.actionButtonLink) return true; // No link means no property dependency
    const propertyId = extractPropertyId(reel.actionButtonLink);
    if (!propertyId) return true; // Invalid format, but not our concern
    return properties.some((p) => p.id === propertyId);
  };

  const filteredFeaturedProperties = featuredProperties.filter(
    (featured) =>
      featured.title.toLowerCase().includes(featuredSearch.toLowerCase()) ||
      featured.description?.toLowerCase().includes(featuredSearch.toLowerCase())
  );

  const filteredBuilders = builders.filter(
    (builder) =>
      builder.name.toLowerCase().includes(builderSearch.toLowerCase()) ||
      builder.email?.toLowerCase().includes(builderSearch.toLowerCase()) ||
      builder.phone?.toLowerCase().includes(builderSearch.toLowerCase())
  );

  const handleDeleteFeatured = async (id: string) => {
    if (!confirm("Are you sure you want to delete this featured property?")) {
      return;
    }
    try {
      setDeletingFeaturedId(id);
      const response = await apiClient.delete(`/api/collections/featured/${id}`);
      if (response.data.success) {
        await fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete featured property");
      console.error("Error deleting featured property:", err);
    } finally {
      setDeletingFeaturedId(null);
    }
  };

  const filteredCollections = collections.filter((collection) =>
    collection.title.toLowerCase().includes(collectionSearch.toLowerCase())
  );

  const filteredReels = reels.filter(
    (reel) =>
      reel.title.toLowerCase().includes(reelSearch.toLowerCase()) ||
      reel.link.toLowerCase().includes(reelSearch.toLowerCase())
  );

  const handleDeleteCollection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) {
      return;
    }
    try {
      setDeletingCollectionId(id);
      const response = await apiClient.delete(`/api/collections/collections/${id}`);
      if (response.data.success) {
        await fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete collection");
      console.error("Error deleting collection:", err);
    } finally {
      setDeletingCollectionId(null);
    }
  };

  const handleDeleteReel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reel?")) {
      return;
    }
    try {
      setDeletingReelId(id);
      const response = await apiClient.delete(`/api/collections/reels/${id}`);
      if (response.data.success) {
        await fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete reel");
      console.error("Error deleting reel:", err);
    } finally {
      setDeletingReelId(null);
    }
  };

  const handleDeleteBuilder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this builder?")) {
      return;
    }
    try {
      setDeletingBuilderId(id);
      const response = await apiClient.delete(`/api/collections/builders/${id}`);
      if (response.data.success) {
        await fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete builder");
      console.error("Error deleting builder:", err);
    } finally {
      setDeletingBuilderId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Collections & Reels
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage curated collections and reels
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex gap-2 sm:gap-4 min-w-max">
          <button
            onClick={() => setActiveTab("collections")}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "collections"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <span className="hidden sm:inline">Curated Collections</span>
            <span className="sm:hidden">Collections</span>
          </button>
          <button
            onClick={() => setActiveTab("reels")}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "reels"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Reels
          </button>
          <button
            onClick={() => setActiveTab("featured")}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "featured"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <span className="hidden sm:inline">Featured Properties</span>
            <span className="sm:hidden">Featured</span>
          </button>
          <button
            onClick={() => setActiveTab("builders")}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "builders"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Builders
          </button>
        </div>
      </div>

      {/* Curated Collections Section */}
      {activeTab === "collections" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Curated Collections
            </h2>
            <Link
              href="/admin/collections/collection/new"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add New Collection
            </Link>
          </div>

          {/* Search Bar */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search collections by title..."
                value={collectionSearch}
                onChange={(e) => setCollectionSearch(e.target.value)}
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
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No collections found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {collectionSearch
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first curated collection"}
              </p>
              {!collectionSearch && (
                <Link
                  href="/admin/collections/collection/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add New Collection
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 relative"
                >
                  {/* Image Container with Minimal Overlay */}
                  <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${collection.image}`}
                      alt={collection.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    
                    {/* Property Count Badge - Minimal Design */}
                    {collection.propertyCount !== undefined && collection.propertyCount > 0 && (
                      <div className="absolute top-4 right-4 z-20">
                        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg border border-white/20">
                          <Layers className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {collection.propertyCount}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content - Minimal & Clean */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight flex-1">
                        {collection.title}
                      </h3>
                    </div>

                    {/* Actions - Minimal Design */}
                    <div className="flex items-center justify-end gap-1 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                      <Link
                        href={`/admin/collections/collection/${collection.id}/edit`}
                        className="p-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteCollection(collection.id)}
                        disabled={deletingCollectionId === collection.id}
                        className="p-2.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        {deletingCollectionId === collection.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Subtle Accent Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent group-hover:via-blue-500 dark:group-hover:via-blue-400 transition-all duration-300"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reels Section */}
      {activeTab === "reels" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Reels</h2>
            <Link
              href="/admin/collections/reel/new"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add New Reel
            </Link>
          </div>

          {/* Search Bar */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reels by title or link..."
                value={reelSearch}
                onChange={(e) => setReelSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Reels List */}
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          ) : filteredReels.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No reels found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {reelSearch
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first reel"}
              </p>
              {!reelSearch && (
                <Link
                  href="/admin/collections/reel/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add New Reel
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredReels.map((reel) => {
                const propertyValid = isPropertyValid(reel);
                const propertyId = extractPropertyId(reel.actionButtonLink);
                const propertyImage = propertyId ? propertyImages[propertyId] : null;
                
                return (
                  <div
                    key={reel.id}
                    className={`group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 ${
                      !propertyValid ? "border-red-200 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/5" : ""
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          {propertyImage ? (
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm">
                              <img
                                src={propertyImage}
                                alt={reel.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder-property.jpg";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-sm">
                              <Video className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Title and Status */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1.5">
                                {reel.title}
                              </h3>
                              {reel.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                  {reel.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {!propertyValid && reel.actionButtonLink ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Invalid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Active
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Links Section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {/* Reel Link */}
                            <div className="flex items-start gap-2.5">
                              <Video className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Reel Link</p>
                                <a
                                  href={reel.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate block hover:underline transition-colors"
                                >
                                  {reel.link}
                                </a>
                              </div>
                            </div>

                            {/* Action Button Link */}
                            <div className="flex items-start gap-2.5">
                              <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Action Link</p>
                                {reel.actionButtonLink ? (
                                  <a
                                    href={reel.actionButtonLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate block hover:underline transition-colors"
                                  >
                                    {reel.actionButtonLink}
                                  </a>
                                ) : (
                                  <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                                    Not set
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {propertyValid ? (
                            <Link
                              href={`/admin/collections/reel/${reel.id}/edit`}
                              className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                          ) : (
                            <button
                              disabled
                              className="p-2.5 text-gray-300 dark:text-gray-700 cursor-not-allowed"
                              title="Edit disabled - Property not found"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReel(reel.id)}
                            disabled={deletingReelId === reel.id}
                            className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {deletingReelId === reel.id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent"></div>
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Featured Properties Section */}
      {activeTab === "featured" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Featured Properties
            </h2>
            <Link
              href="/admin/collections/featured/new"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add New Featured Property
            </Link>
          </div>

          {/* Search Bar */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search featured properties by title or description..."
                value={featuredSearch}
                onChange={(e) => setFeaturedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Featured Properties Grid */}
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          ) : filteredFeaturedProperties.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
              {/* <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" /> */}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No featured properties found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {featuredSearch
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first featured property"}
              </p>
              {!featuredSearch && (
                <Link
                  href="/admin/collections/featured/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add New Featured Property
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeaturedProperties.map((featured) => (
                <div
                  key={featured.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Media */}
                  {featured.media && (
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                      {featured.media.type === "image" ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${featured.media.url}`}
                          alt={featured.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <video
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${featured.media.url}`}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {featured.title}
                    </h3>

                    {/* Description */}
                    {featured.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                        {featured.description}
                      </p>
                    )}

                    {/* Client Logos */}
                    {featured.clientLogos.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Client Logos:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {featured.clientLogos.map((logo, index) => (
                            <img
                              key={index}
                              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${logo}`}
                              alt={`Client logo ${index + 1}`}
                              className="h-8 w-auto object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        href={`/admin/collections/featured/${featured.id}/edit`}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteFeatured(featured.id)}
                        disabled={deletingFeaturedId === featured.id}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        {deletingFeaturedId === featured.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Builders Section */}
      {activeTab === "builders" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Builders</h2>
            <Link
              href="/admin/collections/builder/new"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add New Builder
            </Link>
          </div>

          {/* Search Bar */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search builders by name, email, or phone..."
                value={builderSearch}
                onChange={(e) => setBuilderSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Builders List */}
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          ) : filteredBuilders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No builders found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {builderSearch
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first builder"}
              </p>
              {!builderSearch && (
                <Link
                  href="/admin/collections/builder/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add New Builder
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBuilders.map((builder) => {
                const profilePictureUrl = builder.profilePicture
                  ? builder.profilePicture.startsWith("http")
                    ? builder.profilePicture
                    : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${builder.profilePicture}`
                  : null;

                return (
                  <div
                    key={builder.id}
                    className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                          {profilePictureUrl ? (
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                              <img
                                src={profilePictureUrl}
                                alt={builder.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                              <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1.5">
                                {builder.name}
                              </h3>
                              {builder.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                  {builder.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {builder.email && (
                              <div className="flex items-start gap-2.5">
                                <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</p>
                                  <a
                                    href={`mailto:${builder.email}`}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate block hover:underline transition-colors"
                                  >
                                    {builder.email}
                                  </a>
                                </div>
                              </div>
                            )}

                            {builder.phone && (
                              <div className="flex items-start gap-2.5">
                                <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                                  <a
                                    href={`tel:${builder.phone}`}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate block hover:underline transition-colors"
                                  >
                                    {builder.phone}
                                  </a>
                                </div>
                              </div>
                            )}

                            {builder.website && (
                              <div className="flex items-start gap-2.5">
                                <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Website</p>
                                  <a
                                    href={builder.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate block hover:underline transition-colors"
                                  >
                                    {builder.website}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link
                            href={`/admin/collections/builder/${builder.id}/edit`}
                            className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteBuilder(builder.id)}
                            disabled={deletingBuilderId === builder.id}
                            className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {deletingBuilderId === builder.id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent"></div>
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

