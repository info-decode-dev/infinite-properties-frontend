"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus, Upload, MapPin, Map, ExternalLink, Info, Car, Waves, Baby, Dumbbell, Shield, ArrowUpDown, TreePine, Zap, Droplet, Building, Wifi, UtensilsCrossed, Home, Sparkles, Crown, Tag, Award, Flame, Check, ChevronDown, Search } from "lucide-react";
import { PropertyFormData, BHKType, ConstructionStatus, PropertyType, PropertyTag, Location, DeveloperInfo, Amenity, FurnishedStatus, Negotiation, Accessibility, LandType, PlotSizeUnit, Ownership } from "@/types/property";
import { CuratedCollection } from "@/types/collection";
import { Builder } from "@/types/builder";
import { INDIAN_STATES, INDIAN_CITIES } from "@/constants/indianLocations";
import LocationMap from "@/components/LocationMap";
import apiClient from "@/lib/api";

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData & { existingImages?: string[]; collectionIds?: string[] }) => void;
  initialData?: Partial<PropertyFormData & { existingImages?: string[]; collections?: any[] }>;
  isSubmitting?: boolean;
}

const BHK_OPTIONS: BHKType[] = ["Studio", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"];
const CONSTRUCTION_STATUS_OPTIONS: ConstructionStatus[] = ["Ready to Move", "Under Construction", "Pre-Launch"];
const PROPERTY_TYPE_OPTIONS: PropertyType[] = ["Home", "Villa", "Flat", "Apartment", "Plot", "Commercial", "Farmhouse", "Bungalow", "Resort"];
const FURNISHED_STATUS_OPTIONS: FurnishedStatus[] = ["Furnished", "Semi-Furnished", "Unfurnished"];
const NEGOTIATION_OPTIONS: Negotiation[] = ["Negotiable", "Slightly Negotiable", "Not Negotiable"];
const PROPERTY_TAGS: PropertyTag[] = ["New", "Luxury", "Best Deal", "Featured", "Hot Deal"];
const LAND_TYPE_OPTIONS: LandType[] = ["Residential Land", "Commercial Land", "Resort Land", "Agricultural Land", "Special Purpose Land"];
const PLOT_SIZE_UNIT_OPTIONS: PlotSizeUnit[] = ["Cent", "Acre", "Square Feet"];
const OWNERSHIP_OPTIONS: Ownership[] = ["Freehold", "Leasehold"];

// Tag icons and descriptions
const TAG_INFO: { [key: string]: { icon: any; description: string; color: string } } = {
  "New": {
    icon: Sparkles,
    description: "Recently added property listing",
    color: "bg-blue-500",
  },
  "Luxury": {
    icon: Crown,
    description: "Premium high-end property",
    color: "bg-purple-500",
  },
  "Best Deal": {
    icon: Tag,
    description: "Great value for money property",
    color: "bg-green-500",
  },
  "Featured": {
    icon: Award,
    description: "Highlighted featured property",
    color: "bg-yellow-500",
  },
  "Hot Deal": {
    icon: Flame,
    description: "Popular or trending property",
    color: "bg-orange-500",
  },
};

// Common amenities with their default icons
const COMMON_AMENITIES = [
  { name: "Parking", icon: "Car" },
  { name: "Swimming Pool", icon: "Waves" },
  { name: "Play Area", icon: "Baby" },
  { name: "Gym / Fitness Center", icon: "Dumbbell" },
  { name: "Security", icon: "Shield" },
  { name: "Elevator", icon: "ArrowUpDown" },
  { name: "Garden / Park", icon: "TreePine" },
  { name: "Power Backup", icon: "Zap" },
  { name: "Water Supply", icon: "Droplet" },
  { name: "Clubhouse", icon: "Building" },
  { name: "WiFi", icon: "Wifi" },
  { name: "Restaurant / Cafe", icon: "UtensilsCrossed" },
  { name: "24/7 Security", icon: "Shield" },
  { name: "Landscaped Gardens", icon: "TreePine" },
  { name: "Children's Playground", icon: "Baby" },
  { name: "Jogging Track", icon: "Dumbbell" },
  { name: "Community Hall", icon: "Building" },
  { name: "Rainwater Harvesting", icon: "Droplet" },
];

// Icon mapping for lucide-react icons
const ICON_MAP: { [key: string]: any } = {
  Car,
  Waves,
  Baby,
  Dumbbell,
  Shield,
  ArrowUpDown,
  TreePine,
  Zap,
  Droplet,
  Building,
  Wifi,
  UtensilsCrossed,
  Home,
  Sparkles,
};

// Default icon for custom amenities
const DEFAULT_ICON = "Sparkles";

// Helper function to format price in Indian format
const formatPrice = (price: number | undefined): string => {
  if (!price || price === 0) return "";
  
  const crore = 10000000; // 1 crore = 10 million
  const lakh = 100000; // 1 lakh = 100 thousand
  
  if (price >= crore) {
    const crores = price / crore;
    return `${crores.toFixed(1)} cr`;
  } else if (price >= lakh) {
    const lakhs = price / lakh;
    return `${lakhs.toFixed(1)} L`;
  } else {
    return `₹${price.toLocaleString("en-IN")}`;
  }
};

export default function PropertyForm({ onSubmit, initialData, isSubmitting = false }: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData & { existingImages?: string[]; collectionIds?: string[] }>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    images: [],
    actualPrice: initialData?.actualPrice || 0,
    offerPrice: initialData?.offerPrice,
    location: initialData?.location || {
      exactLocation: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
      latitude: undefined,
      longitude: undefined,
    },
    bhkType: initialData?.bhkType,
    propertyType: initialData?.propertyType || "Home",
    constructionStatus: initialData?.constructionStatus,
    landArea: initialData?.landArea,
    landAreaUnit: initialData?.landAreaUnit || "cent",
    builtUpArea: initialData?.builtUpArea,
    furnishedStatus: initialData?.furnishedStatus,
    negotiation: initialData?.negotiation,
    nearbyLandmarks: initialData?.nearbyLandmarks || [],
    accessibility: initialData?.accessibility || [],
    tags: initialData?.tags || [],
    amenities: initialData?.amenities || [],
    developerInfo: initialData?.developerInfo || {
      name: "",
      email: "",
      phone: "",
      website: "",
      description: "",
    },
    // Plot-specific fields
    landType: initialData?.landType,
    plotSize: initialData?.plotSize,
    plotSizeUnit: initialData?.plotSizeUnit,
    ownership: initialData?.ownership,
    existingImages: initialData?.existingImages || [],
    collectionIds: initialData?.collections?.map((c: any) => c.id) || [],
  });

  const [newAmenity, setNewAmenity] = useState({ name: "", icon: DEFAULT_ICON });
  const [selectedAmenityIcon, setSelectedAmenityIcon] = useState<string>(DEFAULT_ICON);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconPickerOpenFor, setIconPickerOpenFor] = useState<string | null>(null);
  const [newAccessibility, setNewAccessibility] = useState({ name: "", distance: "", unit: "kilometer" as "meter" | "kilometer" });
  const [newLandmark, setNewLandmark] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [hasOfferPrice, setHasOfferPrice] = useState(!!initialData?.offerPrice);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [collections, setCollections] = useState<CuratedCollection[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [selectedBuilderId, setSelectedBuilderId] = useState<string | null>(null);
  const [isBuilderDropdownOpen, setIsBuilderDropdownOpen] = useState(false);
  const [builderSearchQuery, setBuilderSearchQuery] = useState("");
  const builderDropdownRef = useRef<HTMLDivElement>(null);
  const builderSearchRef = useRef<HTMLInputElement>(null);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  useEffect(() => {
    if (formData.location.state && INDIAN_CITIES[formData.location.state]) {
      setAvailableCities(INDIAN_CITIES[formData.location.state]);
    } else {
      setAvailableCities([]);
    }
  }, [formData.location.state]);

  // Fetch curated collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoadingCollections(true);
        const response = await apiClient.get("/api/collections/collections");
        if (response.data.success) {
          setCollections(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
      } finally {
        setIsLoadingCollections(false);
      }
    };

    fetchCollections();
    fetchBuilders();
  }, []);

  // Fetch builders
  const fetchBuilders = async () => {
    try {
      const response = await apiClient.get("/api/collections/builders");
      if (response.data.success) {
        setBuilders(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching builders:", err);
    }
  };

  // Handle builder selection
  const handleBuilderSelect = (builderId: string) => {
    const builder = builders.find((b) => b.id === builderId);
    if (builder) {
      setSelectedBuilderId(builderId);
      setFormData({
        ...formData,
        developerInfo: {
          name: builder.name,
          email: builder.email || "",
          phone: builder.phone || "",
          website: builder.website || "",
          description: builder.description || "",
        },
      });
      setIsBuilderDropdownOpen(false);
      setBuilderSearchQuery("");
    }
  };

  // Clear builder selection
  const handleClearBuilder = () => {
    setSelectedBuilderId(null);
    setFormData({
      ...formData,
      developerInfo: {
        name: "",
        email: "",
        phone: "",
        website: "",
        description: "",
      },
    });
  };

  // Filter builders based on search
  const filteredBuilders = builders.filter((builder) => {
    if (!builderSearchQuery.trim()) return true;
    const query = builderSearchQuery.toLowerCase();
    return (
      builder.name.toLowerCase().includes(query) ||
      builder.email?.toLowerCase().includes(query) ||
      builder.phone?.toLowerCase().includes(query)
    );
  });

  // Close builder dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (builderDropdownRef.current && !builderDropdownRef.current.contains(event.target as Node)) {
        setIsBuilderDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isBuilderDropdownOpen && builderSearchRef.current) {
      builderSearchRef.current.focus();
    }
  }, [isBuilderDropdownOpen]);

  // Close icon pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.icon-picker-container')) {
        setShowIconPicker(false);
        setIconPickerOpenFor(null);
      }
    };

    if (showIconPicker || iconPickerOpenFor) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showIconPicker, iconPickerOpenFor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData({
        ...formData,
        images: [...formData.images, ...files],
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const removeExistingImage = (index: number) => {
    setFormData({
      ...formData,
      existingImages: formData.existingImages?.filter((_, i) => i !== index) || [],
    });
  };

  const toggleTag = (tag: PropertyTag) => {
    setFormData({
      ...formData,
      tags: formData.tags.includes(tag)
        ? formData.tags.filter((t) => t !== tag)
        : [...formData.tags, tag],
    });
  };

  const addAmenityFromDropdown = (amenity: { name: string; icon: string }) => {
    setFormData({
      ...formData,
      amenities: [
        ...formData.amenities,
        {
          id: Date.now().toString(),
          name: amenity.name,
          icon: amenity.icon,
        },
      ],
    });
  };

  const addAmenity = () => {
    if (newAmenity.name.trim()) {
      setFormData({
        ...formData,
        amenities: [
          ...formData.amenities,
          {
            id: Date.now().toString(),
            name: newAmenity.name,
            icon: selectedAmenityIcon,
          },
        ],
      });
      setNewAmenity({ name: "", icon: DEFAULT_ICON });
      setSelectedAmenityIcon(DEFAULT_ICON);
    }
  };

  const updateAmenityIcon = (amenityId: string, icon: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.map((a) =>
        a.id === amenityId ? { ...a, icon } : a
      ),
    });
  };

  const removeAmenity = (id: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((a) => a.id !== id),
    });
  };

  const addAccessibility = () => {
    if (newAccessibility.name.trim() && newAccessibility.distance) {
      setFormData({
        ...formData,
        accessibility: [
          ...(formData.accessibility || []),
          {
            id: Date.now().toString(),
            name: newAccessibility.name,
            distance: parseFloat(newAccessibility.distance),
            unit: newAccessibility.unit,
          },
        ],
      });
      setNewAccessibility({ name: "", distance: "", unit: "kilometer" });
    }
  };

  const removeAccessibility = (id: string) => {
    setFormData({
      ...formData,
      accessibility: (formData.accessibility || []).filter((a) => a.id !== id),
    });
  };

  const addLandmark = () => {
    if (newLandmark.trim()) {
      setFormData({
        ...formData,
        nearbyLandmarks: [...(formData.nearbyLandmarks || []), newLandmark.trim()],
      });
      setNewLandmark("");
    }
  };

  const removeLandmark = (index: number) => {
    setFormData({
      ...formData,
      nearbyLandmarks: (formData.nearbyLandmarks || []).filter((_, i) => i !== index),
    });
  };

  const toggleCollection = (collectionId: string) => {
    setFormData({
      ...formData,
      collectionIds: formData.collectionIds?.includes(collectionId)
        ? formData.collectionIds.filter((id) => id !== collectionId)
        : [...(formData.collectionIds || []), collectionId],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Property Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter property title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter property description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Property Type *
            </label>
            <select
              value={formData.propertyType}
              onChange={(e) => {
                const newPropertyType = e.target.value as PropertyType;
                // Reset plot-specific fields when switching away from Plot
                if (newPropertyType !== "Plot") {
                  setFormData({ 
                    ...formData, 
                    propertyType: newPropertyType,
                    landType: undefined,
                    plotSize: undefined,
                    plotSizeUnit: undefined,
                    ownership: undefined,
                  });
                } else {
                  // Reset non-plot fields when switching to Plot
                  setFormData({ 
                    ...formData, 
                    propertyType: newPropertyType,
                    bhkType: undefined,
                    constructionStatus: undefined,
                    builtUpArea: undefined,
                    furnishedStatus: undefined,
                    tags: [],
                    developerInfo: {
                      name: "",
                      email: "",
                      phone: "",
                      website: "",
                      description: "",
                    },
                  });
                }
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PROPERTY_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {formData.propertyType !== "Plot" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                BHK Type *
              </label>
              <select
                value={formData.bhkType || ""}
                onChange={(e) => setFormData({ ...formData, bhkType: e.target.value as BHKType })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BHK_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {formData.propertyType !== "Plot" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Construction Status *
            </label>
            <select
              value={formData.constructionStatus || ""}
              onChange={(e) =>
                setFormData({ ...formData, constructionStatus: e.target.value as ConstructionStatus })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CONSTRUCTION_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Plot-specific fields */}
        {formData.propertyType === "Plot" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Land Type *
              </label>
              <select
                value={formData.landType || ""}
                onChange={(e) => setFormData({ ...formData, landType: e.target.value as LandType })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Land Type</option>
                {LAND_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plot Size *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.plotSize || ""}
                    onChange={(e) => setFormData({ ...formData, plotSize: e.target.value ? parseFloat(e.target.value) : undefined })}
                    required
                    min="0"
                    step="0.01"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                  <select
                    value={formData.plotSizeUnit || ""}
                    onChange={(e) => setFormData({ ...formData, plotSizeUnit: e.target.value as PlotSizeUnit })}
                    required
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unit</option>
                    {PLOT_SIZE_UNIT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ownership *
                </label>
                <select
                  value={formData.ownership || ""}
                  onChange={(e) => setFormData({ ...formData, ownership: e.target.value as Ownership })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Ownership</option>
                  {OWNERSHIP_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Land Area *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.landArea || ""}
                onChange={(e) => setFormData({ ...formData, landArea: e.target.value ? parseFloat(e.target.value) : undefined })}
                required
                min="0"
                step="0.01"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <select
                value={formData.landAreaUnit || "cent"}
                onChange={(e) => setFormData({ ...formData, landAreaUnit: e.target.value as "cent" | "acre" })}
                required
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cent">Cent</option>
                <option value="acre">Acre</option>
              </select>
            </div>
          </div>

          {formData.propertyType !== "Plot" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Built Up Area (Square Feet) *
              </label>
              <input
                type="number"
                value={formData.builtUpArea || ""}
                onChange={(e) => setFormData({ ...formData, builtUpArea: e.target.value ? parseFloat(e.target.value) : undefined })}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          )}
        </div>

        {formData.propertyType !== "Plot" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Furnished Status
              </label>
              <select
                value={formData.furnishedStatus || ""}
                onChange={(e) => setFormData({ ...formData, furnishedStatus: e.target.value ? e.target.value as FurnishedStatus : undefined })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Furnished Status</option>
                {FURNISHED_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Negotiation
            </label>
            <select
              value={formData.negotiation || ""}
              onChange={(e) => setFormData({ ...formData, negotiation: e.target.value ? e.target.value as Negotiation : undefined })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Negotiation Status</option>
              {NEGOTIATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        )}
      </div>

      {/* Pricing */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Property Price (₹) *
            </label>
            <input
              type="number"
              value={formData.actualPrice || ""}
              onChange={(e) => setFormData({ ...formData, actualPrice: parseFloat(e.target.value) || 0 })}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
            {formData.actualPrice > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-md border border-blue-200 dark:border-blue-800">
                  {formatPrice(formData.actualPrice)}
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                id="hasOfferPrice"
                checked={hasOfferPrice}
                onChange={(e) => {
                  setHasOfferPrice(e.target.checked);
                  if (!e.target.checked) {
                    setFormData({ ...formData, offerPrice: undefined });
                  }
                }}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="hasOfferPrice" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                Add Special Offer Price
              </label>
            </div>
            <input
              type="number"
              value={formData.offerPrice || ""}
              onChange={(e) =>
                setFormData({ ...formData, offerPrice: e.target.value ? parseFloat(e.target.value) : undefined })
              }
              disabled={!hasOfferPrice}
              min="0"
              step="0.01"
              className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !hasOfferPrice ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700" : ""
              }`}
              placeholder={hasOfferPrice ? "0.00" : "Enable checkbox to add offer price"}
            />
            {formData.offerPrice && formData.offerPrice > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-md border border-green-200 dark:border-green-800">
                  {formatPrice(formData.offerPrice)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Property Location
          </h2>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Info className="w-4 h-4" />
            <span>Complete location details help buyers find your property easily</span>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address Information
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Enter the complete address including street name, building number, area, and nearby landmarks
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Complete Address / Street Address *
            </label>
            <input
              type="text"
              value={formData.location.exactLocation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, exactLocation: e.target.value },
                })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 123 Main Street, Near ABC Mall, Downtown Area"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Include building number, street name, area, and nearby landmarks for better visibility
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                State / Province *
              </label>
              <select
                value={formData.location.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, state: e.target.value, city: "" },
                  })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City / District *
              </label>
              <select
                value={formData.location.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, city: e.target.value },
                  })
                }
                required
                disabled={!formData.location.state}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select City</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pincode / Postal Code
              </label>
              <input
                type="text"
                value={formData.location.pincode || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, pincode: e.target.value },
                  })
                }
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 682001 (6 digits for India)"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Pincode helps improve location accuracy for geocoding
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country *
              </label>
              <input
                type="text"
                value={formData.location.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, country: e.target.value },
                  })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., India"
              />
            </div>
          </div>
        </div>

        {/* Map Location Picker */}
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
              <Map className="w-4 h-4" />
              Map Location (GPS Coordinates)
            </h3>
            <p className="text-xs text-green-700 dark:text-green-400 mb-3">
              Pin the exact location on the map for accurate property positioning. This helps buyers find your property easily.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                disabled
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-400 text-white text-sm rounded-lg cursor-not-allowed opacity-50"
              >
                <Map className="w-4 h-4" />
                {showMapPicker ? "Hide Map" : "Show Map Picker"}
              </button>
              {formData.location.latitude && formData.location.longitude && (
                <>
                  <a
                    href={`https://www.google.com/maps?q=${formData.location.latitude},${formData.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Google Maps
                  </a>
                  <a
                    href={`https://maps.apple.com/?q=${formData.location.latitude},${formData.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Apple Maps
                  </a>
                </>
              )}
            </div>
          </div>

          {showMapPicker && (
            <div className="space-y-3">
              <LocationMap
                latitude={formData.location.latitude || 20.5937}
                longitude={formData.location.longitude || 78.9629}
                onLocationChange={(lat, lng) => {
                  setFormData({
                    ...formData,
                    location: {
                      ...formData.location,
                      latitude: lat,
                      longitude: lng,
                    },
                  });
                }}
                height="400px"
                address={formData.location.exactLocation}
                city={formData.location.city}
                state={formData.location.state}
                editable={true}
              />
              {!formData.location.latitude && !formData.location.longitude && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    💡 <strong>Tip:</strong> Click anywhere on the map or drag the marker to set the exact property location. 
                    The coordinates will be automatically saved.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Latitude (GPS)
              </label>
              <input
                type="number"
                value={formData.location.latitude || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: {
                      ...formData.location,
                      latitude: e.target.value ? parseFloat(e.target.value) : undefined,
                    },
                  })
                }
                step="any"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 9.9312"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Use map picker above or enter manually
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Longitude (GPS)
              </label>
              <input
                type="number"
                value={formData.location.longitude || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: {
                      ...formData.location,
                      longitude: e.target.value ? parseFloat(e.target.value) : undefined,
                    },
                  })
                }
                step="any"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 76.2673"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Use map picker above or enter manually
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Images</h2>

        {/* Existing Images */}
        {formData.existingImages && formData.existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Existing Images
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.existingImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Existing ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add New Images
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <Upload className="w-6 h-6 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Add Image</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Tags - Hidden for Plot properties */}
      {formData.propertyType !== "Plot" && (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Property Tags</h2>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Info className="w-4 h-4" />
            <span>Select tags to highlight your property (multiple selection allowed)</span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
            <strong>Tip:</strong> Tags help buyers quickly identify special properties. Use tags to highlight unique features or special offers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROPERTY_TAGS.map((tag) => {
            const tagInfo = TAG_INFO[tag];
            const IconComponent = tagInfo?.icon || Tag;
            const isSelected = formData.tags.includes(tag);
            
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? `${tagInfo?.color || "bg-blue-500"} text-white border-transparent shadow-lg`
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected 
                      ? "bg-white/20" 
                      : "bg-gray-100 dark:bg-gray-600"
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      isSelected 
                        ? "text-white" 
                        : "text-gray-600 dark:text-gray-300"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">{tag}</div>
                    {tagInfo?.description && (
                      <div className={`text-xs ${
                        isSelected 
                          ? "text-white/90" 
                          : "text-gray-500 dark:text-gray-400"
                      }`}>
                        {tagInfo.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {formData.tags.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-700 dark:text-green-400">
              <strong>{formData.tags.length}</strong> tag{formData.tags.length !== 1 ? "s" : ""} selected: {formData.tags.join(", ")}
            </p>
          </div>
        )}
      </div>
      )}

      {/* Amenities */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Amenities</h2>

        {/* Common Amenities Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add Common Amenities
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                const amenity = COMMON_AMENITIES.find((a) => a.name === e.target.value);
                if (amenity && !formData.amenities.some((a) => a.name === amenity.name)) {
                  addAmenityFromDropdown(amenity);
                  e.target.value = "";
                }
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue=""
          >
            <option value="">Select a common amenity to add...</option>
            {COMMON_AMENITIES.filter(
              (amenity) => !formData.amenities.some((a) => a.name === amenity.name)
            ).map((amenity) => {
              const IconComponent = ICON_MAP[amenity.icon] || ICON_MAP[DEFAULT_ICON];
              return (
                <option key={amenity.name} value={amenity.name}>
                  {amenity.name}
                </option>
              );
            })}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Select from common amenities or add custom amenities below
          </p>
        </div>

        {/* Custom Amenity Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add Custom Amenity
          </label>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newAmenity.name}
                onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                placeholder="Enter custom amenity name"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {(() => {
                  const IconComponent = ICON_MAP[selectedAmenityIcon] || ICON_MAP[DEFAULT_ICON];
                  return <IconComponent className="w-5 h-5" />;
                })()}
                <span className="text-sm hidden sm:inline">Select Icon</span>
                <span className="text-sm sm:hidden">Icon</span>
              </button>
              <button
                type="button"
                onClick={addAmenity}
                disabled={!newAmenity.name.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>

            {/* Icon Picker */}
            {showIconPicker && (
              <div className="icon-picker-container bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Icon for "{newAmenity.name || "Custom Amenity"}"
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {Object.keys(ICON_MAP).map((iconName) => {
                    const IconComponent = ICON_MAP[iconName];
                    const isSelected = selectedAmenityIcon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => {
                          setSelectedAmenityIcon(iconName);
                          setNewAmenity({ ...newAmenity, icon: iconName });
                        }}
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                        title={iconName}
                      >
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mx-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Added Amenities List */}
        {formData.amenities.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Added Amenities ({formData.amenities.length})
            </label>
            <div className="space-y-2">
              {formData.amenities.map((amenity) => {
                const IconComponent = ICON_MAP[amenity.icon] || ICON_MAP[DEFAULT_ICON];
                const isIconPickerOpen = iconPickerOpenFor === amenity.id;
                return (
                  <div
                    key={amenity.id}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 gap-2"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => setIconPickerOpenFor(isIconPickerOpen ? null : amenity.id)}
                          className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                          title="Change icon"
                        >
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        {isIconPickerOpen && (
                          <div className="icon-picker-container absolute top-full left-0 mt-2 z-10 bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-700 shadow-lg max-w-[280px] sm:max-w-none">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Select Icon for "{amenity.name}"
                            </p>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 max-h-[200px] overflow-y-auto">
                              {Object.keys(ICON_MAP).map((iconName) => {
                                const Icon = ICON_MAP[iconName];
                                const isSelected = amenity.icon === iconName;
                                return (
                                  <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => {
                                      updateAmenityIcon(amenity.id, iconName);
                                      setIconPickerOpenFor(null);
                                    }}
                                    className={`p-1.5 sm:p-2 rounded border transition-colors ${
                                      isSelected
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                    }`}
                                    title={iconName}
                                  >
                                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 mx-auto text-gray-700 dark:text-gray-300" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium text-sm sm:text-base truncate">{amenity.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity.id)}
                      className="text-red-500 hover:text-red-700 p-1.5 sm:p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                      title="Remove amenity"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Accessibility */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Accessibility (Reachable Locations)</h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <input
            type="text"
            value={newAccessibility.name}
            onChange={(e) => setNewAccessibility({ ...newAccessibility, name: e.target.value })}
            placeholder="Location name (e.g., Railway station)"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={newAccessibility.distance}
              onChange={(e) => setNewAccessibility({ ...newAccessibility, distance: e.target.value })}
              placeholder="Distance"
              min="0"
              step="0.01"
              className="w-24 sm:w-32 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            <select
              value={newAccessibility.unit}
              onChange={(e) => setNewAccessibility({ ...newAccessibility, unit: e.target.value as "meter" | "kilometer" })}
              className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="meter">Meter</option>
              <option value="kilometer">Kilometer</option>
            </select>
            <button
              type="button"
              onClick={addAccessibility}
              disabled={!newAccessibility.name.trim() || !newAccessibility.distance}
              className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
              title="Add accessibility"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {(formData.accessibility || []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(formData.accessibility || []).map((accessibility) => (
              <div
                key={accessibility.id}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
              >
                <span className="text-gray-900 dark:text-white">
                  {accessibility.name} - {accessibility.distance} {accessibility.unit}
                </span>
                <button
                  type="button"
                  onClick={() => removeAccessibility(accessibility.id!)}
                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nearby Landmarks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Nearby Landmarks (Drive Time)</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newLandmark}
            onChange={(e) => setNewLandmark(e.target.value)}
            placeholder="e.g., 15 min to Ernakulam town railway station"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLandmark();
              }
            }}
          />
          <button
            type="button"
            onClick={addLandmark}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(formData.nearbyLandmarks || []).map((landmark, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              <span className="text-gray-900 dark:text-white">{landmark}</span>
              <button
                type="button"
                onClick={() => removeLandmark(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Curated Collections */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Curated Collections</h2>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Info className="w-4 h-4" />
            <span>Add this property to curated collections for better organization and filtering</span>
          </div>
        </div>

        {isLoadingCollections ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading collections...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              No curated collections available. Create collections in the Collections section first.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Select one or more collections to add this property to. Properties in collections can be easily filtered and displayed together.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((collection) => {
                const isSelected = formData.collectionIds?.includes(collection.id) || false;
                const imageUrl = collection.image?.startsWith('http') 
                  ? collection.image 
                  : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${collection.image}`;
                
                return (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => toggleCollection(collection.id)}
                    className={`relative p-4 rounded-lg border-2 transition-all text-left overflow-hidden ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-500"
                    }`}
                  >
                    {/* Collection Image */}
                    {collection.image && (
                      <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                        <img
                          src={imageUrl}
                          alt={collection.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-collection.jpg";
                          }}
                        />
                      </div>
                    )}

                    {/* Collection Title */}
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                      {collection.title}
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {formData.collectionIds && formData.collectionIds.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-sm text-green-700 dark:text-green-400">
                  <strong>{formData.collectionIds.length}</strong> collection{formData.collectionIds.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Developer Info - Hidden for Plot properties */}
      {formData.propertyType !== "Plot" && (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Developer Information</h2>

        {/* Builder Selection Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Builder (Optional)
          </label>
          <div className="relative" ref={builderDropdownRef}>
            <div
              onClick={() => setIsBuilderDropdownOpen(!isBuilderDropdownOpen)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {selectedBuilderId ? (
                  <span className="truncate">
                    {builders.find((b) => b.id === selectedBuilderId)?.name || "Select a builder"}
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">Select a builder to auto-fill developer info</span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {selectedBuilderId && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearBuilder();
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isBuilderDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {/* Dropdown Menu */}
            {isBuilderDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
                {/* Search Input */}
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      ref={builderSearchRef}
                      value={builderSearchQuery}
                      onChange={(e) => setBuilderSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Search builders..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
                {/* Builder List */}
                <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                  {filteredBuilders.length > 0 ? (
                    filteredBuilders.map((builder) => (
                      <li
                        key={builder.id}
                        onClick={() => handleBuilderSelect(builder.id)}
                        className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          selectedBuilderId === builder.id
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{builder.name}</span>
                          {builder.email && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">{builder.email}</span>
                          )}
                        </div>
                        {selectedBuilderId === builder.id && (
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="p-3 text-gray-500 dark:text-gray-400 text-sm text-center">
                      No builders found.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Select a builder to automatically fill developer information fields below.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Developer Name *
          </label>
          <input
            type="text"
            value={formData.developerInfo.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                developerInfo: { ...formData.developerInfo, name: e.target.value },
              })
            }
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.developerInfo.email || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  developerInfo: { ...formData.developerInfo, email: e.target.value },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 font-medium">+91</span>
              <input
                type="tel"
                value={formData.developerInfo.phone?.replace(/^\+91\s*/, "") || ""}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^\d]/g, "");
                  if (value.length > 10) value = value.slice(0, 10);
                  setFormData({
                    ...formData,
                    developerInfo: { ...formData.developerInfo, phone: value ? `+91 ${value}` : "" },
                  });
                }}
                className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="9876543210"
                maxLength={10}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter 10-digit Indian phone number (country code +91 will be added automatically)
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.developerInfo.website || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                developerInfo: { ...formData.developerInfo, website: e.target.value },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.developerInfo.description || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                developerInfo: { ...formData.developerInfo, description: e.target.value },
              })
            }
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Property"}
        </button>
      </div>
    </form>
  );
}

