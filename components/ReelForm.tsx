"use client";

import { useState, useEffect, useRef } from "react";
import { Property } from "@/types/property";
import { ReelFormData } from "@/types/collection";
import apiClient from "@/lib/api";
import { Search, ChevronDown, X } from "lucide-react";

interface ReelFormProps {
  onSubmit: (data: ReelFormData) => void;
  initialData?: Partial<ReelFormData>;
  properties?: Property[];
  isSubmitting?: boolean;
}

export default function ReelForm({ onSubmit, initialData, properties = [], isSubmitting = false }: ReelFormProps) {
  const [formData, setFormData] = useState<ReelFormData>({
    link: initialData?.link || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    actionButtonLink: initialData?.actionButtonLink || "",
  });
  const [isLoadingProperty, setIsLoadingProperty] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-fill title and description when action button link (property) is selected
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!formData.actionButtonLink || !formData.actionButtonLink.startsWith('/properties/')) {
        return;
      }

      // Extract property ID from the link
      const propertyId = formData.actionButtonLink.split('/properties/')[1];
      if (!propertyId) return;

      // Check if property is already in the properties list
      const existingProperty = properties.find(p => p.id === propertyId);
      
      if (existingProperty) {
        // Use existing property data - only auto-fill if title is empty or matches initial
        const shouldAutoFill = !formData.title || formData.title === initialData?.title || formData.title === "";
        if (shouldAutoFill) {
          setFormData(prev => ({
            ...prev,
            title: existingProperty.title,
            description: existingProperty.description || prev.description || "",
          }));
        }
      } else {
        // Fetch property details from API
        setIsLoadingProperty(true);
        try {
          const response = await apiClient.get(`/api/properties/public/${propertyId}`);
          if (response.data.success && response.data.data) {
            const property = response.data.data;
            // Only auto-fill if title is empty or matches initial
            const shouldAutoFill = !formData.title || formData.title === initialData?.title || formData.title === "";
            if (shouldAutoFill) {
              setFormData(prev => ({
                ...prev,
                title: property.title,
                description: property.description || prev.description || "",
              }));
            }
          }
        } catch (error) {
          console.error('Error fetching property details:', error);
        } finally {
          setIsLoadingProperty(false);
        }
      }
    };

    fetchPropertyDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.actionButtonLink]);

  // Filter properties based on search query (title, state, city, address)
  const filteredProperties = properties.filter((property) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const titleMatch = property.title.toLowerCase().includes(query);
    const stateMatch = property.location?.state?.toLowerCase().includes(query);
    const cityMatch = property.location?.city?.toLowerCase().includes(query);
    const addressMatch = property.location?.exactLocation?.toLowerCase().includes(query);
    
    return titleMatch || stateMatch || cityMatch || addressMatch;
  });

  // Get selected property
  const selectedProperty = properties.find(
    (p) => formData.actionButtonLink === `/properties/${p.id}`
  );

  // Handle property selection
  const handlePropertySelect = (propertyId: string) => {
    const link = `/properties/${propertyId}`;
    setFormData({ ...formData, actionButtonLink: link });
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  // Clear selection
  const handleClearSelection = () => {
    setFormData({ ...formData, actionButtonLink: "" });
    setSearchQuery("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reel Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reel Link (URL) *
          </label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/reel"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter the URL to the reel (video link)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter reel title"
            />
            {isLoadingProperty && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.actionButtonLink ? "Auto-filled from selected property" : "Enter reel title or select a property above"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter reel description"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.actionButtonLink ? "Auto-filled from selected property (you can edit)" : "Enter reel description or select a property above"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Action Button Link *
          </label>
          <div className="relative" ref={dropdownRef}>
            {/* Searchable Select Input */}
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {selectedProperty ? (
                  <span className="truncate">{selectedProperty.title}</span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">Select a property</span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {selectedProperty && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearSelection();
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
                {/* Search Input */}
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Search properties..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Properties List */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map((property) => {
                      const isSelected = formData.actionButtonLink === `/properties/${property.id}`;
                      return (
                        <div
                          key={property.id}
                          onClick={() => handlePropertySelect(property.id)}
                          className={`px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-medium ${
                                isSelected
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-900 dark:text-white"
                              }`}
                            >
                              {property.title}
                            </span>
                            {isSelected && (
                              <span className="text-blue-600 dark:text-blue-400 text-sm">✓</span>
                            )}
                          </div>
                          {property.location && (
                            <div className="mt-1 space-y-0.5">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {property.location.city}, {property.location.state}
                              </p>
                              {property.location.exactLocation && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                  {property.location.exactLocation}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                      {searchQuery ? "No properties found" : "No properties available"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Required: Link to a property page when user clicks the action button. Title and description will be auto-filled from the selected property.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Reel"}
        </button>
      </div>
    </form>
  );
}

