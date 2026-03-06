"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Grid, List, SlidersHorizontal, X, ChevronRight } from "lucide-react";
import { Property } from "@/types/property";
import apiClient from "@/lib/api";
import PropertyCardUiModern from "./PropertyCardUiModern";
import AdvancedFilter from "./AdvancedFilter";
import HeaderText from "./HeaderText";
import gsap from "gsap";
import { usePropertyType } from "@/contexts/PropertyTypeContext";

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "price-low" | "price-high" | "name-asc" | "name-desc";

interface FilterParams {
  search?: string;
  city?: string;
  state?: string;
  bhkType?: string;
  propertyType?: string;
  constructionStatus?: string;
  landType?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  amenities?: string[];
  collectionId?: string;
  page?: number;
  limit?: number;
  sort?: SortOption;
}

const FILTERS_STORAGE_KEY = "property_listing_filters";

export default function PropertyListing() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { propertyType, setPropertyType } = usePropertyType();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    limit: 12,
    sort: "newest",
  });

  // Determine if we're viewing lands based on propertyType filter
  const isViewingLands = filters.propertyType === "Plot";

  const listingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const isSyncingToUrlRef = useRef(false);
  const isUpdatingFromUrlRef = useRef(false);
  const lastUrlRef = useRef<string>("");
  const hasFetchedRef = useRef(false);

  // Helper function to parse filters from URLSearchParams
  const parseFiltersFromParams = useCallback((params: URLSearchParams): FilterParams => {
    const urlFilters: FilterParams = {
      page: 1,
      limit: 12,
      sort: "newest",
    };

    const search = params.get("search");
    const city = params.get("city");
    const state = params.get("state");
    const bhkType = params.get("bhkType");
    const constructionStatus = params.get("constructionStatus");
    const landType = params.get("landType");
    const minPrice = params.get("minPrice");
    const maxPrice = params.get("maxPrice");
    const minArea = params.get("minArea");
    const maxArea = params.get("maxArea");
    const propertyType = params.get("propertyType");
    const amenities = params.getAll("amenities");
    const collectionId = params.get("collectionId");

    if (search) urlFilters.search = search;
    if (city) urlFilters.city = city;
    if (state) urlFilters.state = state;
    if (bhkType) urlFilters.bhkType = bhkType;
    if (constructionStatus) urlFilters.constructionStatus = constructionStatus;
    if (landType) urlFilters.landType = landType;
    if (minPrice) urlFilters.minPrice = minPrice;
    if (maxPrice) urlFilters.maxPrice = maxPrice;
    if (minArea) urlFilters.minArea = minArea;
    if (maxArea) urlFilters.maxArea = maxArea;
    if (propertyType) urlFilters.propertyType = propertyType;
    if (amenities.length > 0) urlFilters.amenities = amenities;
    if (collectionId) urlFilters.collectionId = collectionId;

    return urlFilters;
  }, []);

  // Helper function to build URL query string from filters
  const buildQueryString = useCallback((filterParams: Partial<FilterParams>): string => {
    const params = new URLSearchParams();
    const { page, limit, sort, ...filters } = filterParams;
    
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          value.forEach((v) => params.append(key, v));
        }
      } else if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    return params.toString();
  }, []);

  // Single source of truth: URL -> Filters
  // This effect reads from URL and updates filters state
  // Uses both searchParams and direct window.location.search for reliability
  useEffect(() => {
    // Skip if we're syncing filters to URL (to avoid loops)
    if (isSyncingToUrlRef.current) {
      return;
    }

    // Get URL from both sources for reliability
    const searchParamsUrl = searchParams.toString();
    const windowUrl = typeof window !== "undefined" ? window.location.search.substring(1) : "";
    
    // Use window.location.search as primary source (more reliable)
    const currentUrl = windowUrl || searchParamsUrl;
    
    // Skip if URL hasn't changed
    if (currentUrl === lastUrlRef.current) {
      return;
    }

    // Update last URL
    lastUrlRef.current = currentUrl;

    // Parse filters from actual URL (use window.location.search if available, otherwise searchParams)
    let paramsToParse: URLSearchParams;
    if (typeof window !== "undefined" && window.location.search) {
      paramsToParse = new URLSearchParams(window.location.search);
    } else {
      paramsToParse = searchParams;
    }
    
    const urlFilters = parseFiltersFromParams(paramsToParse);

    // Sync propertyType context with URL params
    if (urlFilters.propertyType === "Plot") {
      setPropertyType("lands");
    } else {
      // If propertyType is not Plot or doesn't exist, default to properties
      setPropertyType("properties");
    }

    // Check if URL has any filter params
    const hasUrlParams = Boolean(
      urlFilters.search || urlFilters.city || urlFilters.state || 
      urlFilters.bhkType || urlFilters.constructionStatus || 
      urlFilters.landType ||
      urlFilters.minPrice || urlFilters.maxPrice || 
      urlFilters.minArea || urlFilters.maxArea || 
      urlFilters.propertyType || 
      urlFilters.collectionId ||
      (urlFilters.amenities && urlFilters.amenities.length > 0)
    );

    if (hasUrlParams) {
      // URL has params - use them as source of truth
      setFilters(urlFilters);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } else if (isInitialLoad) {
      // Initial load with no URL params - try localStorage
      if (typeof window !== "undefined") {
        const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
        if (savedFilters) {
          try {
            const parsed = JSON.parse(savedFilters);
            const { page, limit, sort, ...savedFilterParams } = parsed;
            if (Object.keys(savedFilterParams).length > 0) {
              setFilters({
                ...urlFilters,
                ...savedFilterParams,
              });
            } else {
              setFilters(urlFilters);
            }
          } catch (err) {
            console.error("Error loading filters from localStorage:", err);
            setFilters(urlFilters);
          }
        } else {
          setFilters(urlFilters);
        }
      } else {
        setFilters(urlFilters);
      }
      setIsInitialLoad(false);
    } else {
      // URL params cleared - reset to defaults
      setFilters(urlFilters);
    }
  }, [searchParams, parseFiltersFromParams]);

  // Check for openFilters parameter and open filter sidebar
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const params = new URLSearchParams(window.location.search);
    const openFilters = params.get("openFilters");
    
    if (openFilters === "true") {
      setShowFilters(true);
      // Remove the openFilters parameter from URL after opening
      params.delete("openFilters");
      const newUrl = params.toString() 
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router]);

  // Additional check: Poll window.location.search to catch URL changes that searchParams might miss
  // This is a fallback for cases where Next.js router doesn't immediately update searchParams
  useEffect(() => {
    if (typeof window === "undefined" || isInitialLoad) {
      return;
    }

    let lastChecked = window.location.search.substring(1);

    const checkUrl = () => {
      // Skip if we're syncing
      if (isSyncingToUrlRef.current) {
        return;
      }

      const current = window.location.search.substring(1);
      
      // If URL changed but lastUrlRef doesn't match, force update
      if (current !== lastChecked && current !== lastUrlRef.current) {
        lastChecked = current;
        lastUrlRef.current = current;

        // Parse and update filters directly from URL
        const params = new URLSearchParams(window.location.search);
        const urlFilters = parseFiltersFromParams(params);
        
        // Force update filters
        setFilters((prev) => {
          // Check if filters actually changed
          const changed = 
            prev.search !== urlFilters.search ||
            prev.city !== urlFilters.city ||
            prev.state !== urlFilters.state ||
            prev.bhkType !== urlFilters.bhkType ||
            prev.constructionStatus !== urlFilters.constructionStatus ||
            prev.minPrice !== urlFilters.minPrice ||
            prev.maxPrice !== urlFilters.maxPrice ||
            prev.minArea !== urlFilters.minArea ||
            prev.maxArea !== urlFilters.maxArea ||
            prev.propertyType !== urlFilters.propertyType ||
            prev.collectionId !== urlFilters.collectionId ||
            JSON.stringify(prev.amenities || []) !== JSON.stringify(urlFilters.amenities || []);
          
          return changed ? urlFilters : prev;
        });
      }
    };

    // Check every 100ms for URL changes
    const interval = setInterval(checkUrl, 100);
    
    // Also listen for popstate (browser back/forward)
    window.addEventListener("popstate", checkUrl);

    return () => {
      clearInterval(interval);
      window.removeEventListener("popstate", checkUrl);
    };
  }, [parseFiltersFromParams]);

  // Sync Filters -> URL (only when filters change from AdvancedFilter, not from URL)
  // This effect updates URL when filters change internally (e.g., from AdvancedFilter)
  useEffect(() => {
    // Skip on initial load
    if (isInitialLoad) {
      return;
    }

    // Skip if we're already syncing
    if (isSyncingToUrlRef.current) {
      return;
    }

    const queryString = buildQueryString(filters);
    const currentUrl = searchParams.toString();

    // Only update URL if it's different from current filters
    if (queryString !== currentUrl) {
      isSyncingToUrlRef.current = true;
      lastUrlRef.current = queryString;

      // Use router.replace to update URL without adding to history
      router.replace(queryString ? `/properties?${queryString}` : "/properties", { scroll: false });
      
      // Reset flag after a short delay to allow URL to update
      setTimeout(() => {
        isSyncingToUrlRef.current = false;
      }, 100);
    }
  }, [filters, router, searchParams, buildQueryString]);

  // Memoize fetchProperties to avoid recreating on every render
  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Only send backend-supported filters
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.city) params.append("city", filters.city);
      if (filters.state) params.append("state", filters.state);
      if (filters.bhkType) params.append("bhkType", filters.bhkType);
      if (filters.constructionStatus) params.append("constructionStatus", filters.constructionStatus);
      if (filters.collectionId) params.append("collectionId", filters.collectionId);
      // Fetch more items to allow client-side filtering
      params.append("page", "1");
      params.append("limit", "1000"); // Fetch all for client-side filtering

      const apiUrl = `/api/properties/public${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get(apiUrl);
      
      if (response.data.success) {
        let transformedProperties: Property[] = response.data.data.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          images: p.images || [],
          actualPrice: typeof p.actualPrice === 'string' ? parseFloat(p.actualPrice) || 0 : (p.actualPrice || 0),
          offerPrice: p.offerPrice ? (typeof p.offerPrice === 'string' ? parseFloat(p.offerPrice) : p.offerPrice) : undefined,
          location: p.location || {
            exactLocation: "",
            city: "",
            state: "",
            country: "",
          },
          bhkType: p.bhkType || undefined,
          propertyType: p.propertyType,
          constructionStatus: p.constructionStatus || undefined,
          landArea: p.landArea ? (typeof p.landArea === 'string' ? parseFloat(p.landArea) : p.landArea) : undefined,
          landAreaUnit: p.landAreaUnit,
          builtUpArea: p.builtUpArea ? (typeof p.builtUpArea === 'string' ? parseFloat(p.builtUpArea) : p.builtUpArea) : undefined,
          furnishedStatus: p.furnishedStatus,
          negotiation: p.negotiation,
          nearbyLandmarks: p.nearbyLandmarks || [],
          accessibility: p.accessibility || [],
          tags: p.tags || [],
          amenities: p.amenities || [],
          developerInfo: p.developerInfo || {
            name: "",
          },
          // Plot-specific fields
          landType: p.landType || undefined,
          plotSize: p.plotSize ? (typeof p.plotSize === 'string' ? parseFloat(p.plotSize) : p.plotSize) : undefined,
          plotSizeUnit: p.plotSizeUnit || undefined,
          ownership: p.ownership || undefined,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));

        // Apply client-side filters (not supported by backend)
        if (filters.propertyType) {
          transformedProperties = transformedProperties.filter(
            (p) => p.propertyType === filters.propertyType
          );
        }

        // Apply landType filter for lands
        if (filters.landType) {
          transformedProperties = transformedProperties.filter(
            (p) => p.landType === filters.landType
          );
        }

        // Apply price filters
        if (filters.minPrice || filters.maxPrice) {
          const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : null;
          const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : null;
          
          transformedProperties = transformedProperties.filter((p) => {
            const price = p.actualPrice || 0;
            
            // Check min price
            if (minPrice !== null && !isNaN(minPrice)) {
              if (price < minPrice) {
                return false;
              }
            }
            
            // Check max price
            if (maxPrice !== null && !isNaN(maxPrice)) {
              if (price > maxPrice) {
                return false;
              }
            }
            
            return true;
          });
        }

        if (filters.minArea) {
          const minArea = parseFloat(filters.minArea);
          if (!isNaN(minArea)) {
            transformedProperties = transformedProperties.filter((p) => {
              const area = p.builtUpArea || p.landArea || 0;
              return area >= minArea;
            });
          }
        }

        if (filters.maxArea) {
          const maxArea = parseFloat(filters.maxArea);
          if (!isNaN(maxArea)) {
            transformedProperties = transformedProperties.filter((p) => {
              const area = p.builtUpArea || p.landArea || 0;
              return area <= maxArea;
            });
          }
        }

        if (filters.amenities && filters.amenities.length > 0) {
          transformedProperties = transformedProperties.filter((p) => {
            const propertyAmenityNames = p.amenities.map((a) => a.name);
            return filters.amenities!.every((amenity) =>
              propertyAmenityNames.includes(amenity)
            );
          });
        }

        // Apply client-side sorting
        let sortedProperties = [...transformedProperties];
        switch (sortBy) {
          case "price-low":
            sortedProperties.sort((a, b) => a.actualPrice - b.actualPrice);
            break;
          case "price-high":
            sortedProperties.sort((a, b) => b.actualPrice - a.actualPrice);
            break;
          case "name-asc":
            sortedProperties.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case "name-desc":
            sortedProperties.sort((a, b) => b.title.localeCompare(a.title));
            break;
          case "oldest":
            sortedProperties.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateA - dateB;
            });
            break;
          default: // newest
            sortedProperties.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
        }

        // Apply pagination
        const totalFiltered = sortedProperties.length;
        const pageSize = filters.limit || 12;
        const currentPageNum = filters.page || 1;
        const startIndex = (currentPageNum - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedProperties = sortedProperties.slice(startIndex, endIndex);

        setProperties(paginatedProperties);
        setTotal(totalFiltered);
        setTotalPages(Math.ceil(totalFiltered / pageSize));
        setCurrentPage(currentPageNum);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string }; status?: number }; message?: string };
      console.error("Error fetching properties:", err);
      console.error("Error details:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: `/api/properties/public`,
      });
      
      if (error.response?.status === 404) {
        setError("API endpoint not found. Please check if the server is running on port 5000.");
      } else {
        setError(error.response?.data?.message || error.message || "Failed to fetch properties");
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortBy]);

  // Fetch properties when initial load completes
  useEffect(() => {
    if (!isInitialLoad && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProperties();
    }
  }, [isInitialLoad, fetchProperties]);

  // Fallback: Ensure we fetch properties after a timeout even if isInitialLoad doesn't become false
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!hasFetchedRef.current) {
        console.log("Fallback: Fetching properties after timeout");
        hasFetchedRef.current = true;
        setIsInitialLoad(false);
        fetchProperties();
      }
    }, 500); // 500ms fallback

    return () => clearTimeout(fallbackTimer);
  }, []); // Only run once on mount

  // Fetch properties whenever filters or sortBy change (after initial fetch)
  useEffect(() => {
    if (hasFetchedRef.current) {
      fetchProperties();
    }
  }, [filters, sortBy, fetchProperties]);

  useEffect(() => {
    if (!isLoading && properties.length > 0 && gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".property-card");
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 30,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    }
  }, [properties, isLoading]);

  // Save filters to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const { page, limit, sort, ...filtersToSave } = filters;
      // Only save if there are active filters
      if (Object.values(filtersToSave).some((val) => {
        if (Array.isArray(val)) return val.length > 0;
        return Boolean(val);
      })) {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersToSave));
      } else {
        localStorage.removeItem(FILTERS_STORAGE_KEY);
      }
    }
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<FilterParams>) => {
    setFilters((prev) => {
      const updated = {
        ...prev,
        ...newFilters,
        page: 1, // Reset to first page when filters change
      };
      return updated;
    });
    // Force a small delay to ensure state updates before URL sync
    setTimeout(() => {
      isUpdatingFromUrlRef.current = false;
    }, 0);
  };

  const removeFilter = (filterKey: keyof FilterParams | "priceRange", removeKeys?: (keyof FilterParams)[]) => {
    setFilters((prev) => {
      const updated = { ...prev };
      
      if (removeKeys && removeKeys.length > 0) {
        // Remove multiple keys (for price range)
        removeKeys.forEach((key) => {
          delete updated[key];
        });
      } else if (filterKey !== "priceRange") {
        delete updated[filterKey];
      }
      
      updated.page = 1; // Reset to first page
      return updated;
    });
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setFilters((prev) => ({
      ...prev,
      sort: newSort,
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters((prev) => ({
      ...prev,
      page,
    }));
    if (listingRef.current) {
      listingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const clearFilters = () => {
    const clearedFilters: FilterParams = {
      page: 1,
      limit: 12,
      sort: "newest",
    };
    setFilters(clearedFilters);
    setSortBy("newest");
    if (typeof window !== "undefined") {
      localStorage.removeItem(FILTERS_STORAGE_KEY);
    }
    router.push("/properties");
  };

  const hasActiveFilters = 
    Boolean(filters.search) ||
    Boolean(filters.city) ||
    Boolean(filters.state) ||
    Boolean(filters.bhkType) ||
    Boolean(filters.propertyType) ||
    Boolean(filters.constructionStatus) ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    Boolean(filters.minArea) ||
    Boolean(filters.maxArea) ||
    (filters.amenities && filters.amenities.length > 0);

  const getPriceRangeLabel = (minPrice?: string, maxPrice?: string): string | null => {
    if (!minPrice && !maxPrice) return null;
    
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;
    
    // Check for known price ranges
    if (min === 0 && max === 5000000) return "Under ₹50 Lakhs";
    if (min === 5000000 && max === 10000000) return "₹50 Lakhs - ₹1 Crore";
    if (min === 10000000 && max === 20000000) return "₹1 Crore - ₹2 Crores";
    if (min === 20000000 && max === 50000000) return "₹2 Crores - ₹5 Crores";
    if (min === 50000000 && max === Infinity) return "Above ₹5 Crores";
    
    // Custom range
    if (minPrice && maxPrice) {
      return `₹${(min / 100000).toFixed(0)} Lakhs - ₹${(max / 100000).toFixed(0)} Lakhs`;
    }
    if (minPrice) {
      return `Above ₹${(min / 100000).toFixed(0)} Lakhs`;
    }
    if (maxPrice) {
      return `Under ₹${(max / 100000).toFixed(0)} Lakhs`;
    }
    
    return null;
  };

  const getFilterLabel = (key: keyof FilterParams, value: string | number | string[]): string => {
    if (Array.isArray(value)) {
      return `${key}: ${value.join(", ")}`;
    }
    
    switch (key) {
      case "search":
        return `Search: ${value}`;
      case "city":
        return `City: ${value}`;
      case "state":
        return `State: ${value}`;
      case "bhkType":
        return `BHK: ${value}`;
      case "propertyType":
        return `Type: ${value}`;
      case "constructionStatus":
        return `Status: ${value}`;
      case "landType":
        return `Land Type: ${value}`;
      case "minPrice":
        return `Min Price: ₹${(Number(value) / 100000).toFixed(0)} Lakhs`;
      case "maxPrice":
        return `Max Price: ₹${(Number(value) / 100000).toFixed(0)} Lakhs`;
      case "minArea":
        return `Min Area: ${value} sqft`;
      case "maxArea":
        return `Max Area: ${value} sqft`;
      default:
        return `${key}: ${value}`;
    }
  };

  const getActiveFilterChips = () => {
    const chips: Array<{ key: keyof FilterParams | "priceRange"; label: string; value: string | number | string[]; removeKeys?: (keyof FilterParams)[] }> = [];
    
    if (filters.search) chips.push({ key: "search", label: getFilterLabel("search", filters.search), value: filters.search });
    if (filters.city) chips.push({ key: "city", label: getFilterLabel("city", filters.city), value: filters.city });
    if (filters.state) chips.push({ key: "state", label: getFilterLabel("state", filters.state), value: filters.state });
    if (filters.bhkType) chips.push({ key: "bhkType", label: getFilterLabel("bhkType", filters.bhkType), value: filters.bhkType });
    if (filters.propertyType) chips.push({ key: "propertyType", label: getFilterLabel("propertyType", filters.propertyType), value: filters.propertyType });
    if (filters.constructionStatus) chips.push({ key: "constructionStatus", label: getFilterLabel("constructionStatus", filters.constructionStatus), value: filters.constructionStatus });
    if (filters.landType) chips.push({ key: "landType", label: getFilterLabel("landType", filters.landType), value: filters.landType });
    
    // Handle price range - show as single chip if both min and max are set
    const priceRangeLabel = getPriceRangeLabel(filters.minPrice, filters.maxPrice);
    if (priceRangeLabel) {
      chips.push({ 
        key: "priceRange", 
        label: priceRangeLabel, 
        value: `${filters.minPrice || ""}-${filters.maxPrice || ""}`,
        removeKeys: filters.minPrice && filters.maxPrice ? ["minPrice", "maxPrice"] : filters.minPrice ? ["minPrice"] : ["maxPrice"]
      });
    } else {
      // Show separate chips if not a known range
      if (filters.minPrice) chips.push({ key: "minPrice", label: getFilterLabel("minPrice", filters.minPrice), value: filters.minPrice });
      if (filters.maxPrice) chips.push({ key: "maxPrice", label: getFilterLabel("maxPrice", filters.maxPrice), value: filters.maxPrice });
    }
    
    if (filters.minArea) chips.push({ key: "minArea", label: getFilterLabel("minArea", filters.minArea), value: filters.minArea });
    if (filters.maxArea) chips.push({ key: "maxArea", label: getFilterLabel("maxArea", filters.maxArea), value: filters.maxArea });
    if (filters.amenities && filters.amenities.length > 0) {
      chips.push({ key: "amenities", label: `Amenities: ${filters.amenities.length} selected`, value: filters.amenities });
    }
    
    return chips;
  };

  return (
    <div className="property-listing" ref={listingRef}>
      <div className="page-content-container">
        {/* Breadcrumbs */}
        <div className="property-listing__breadcrumbs">
          <Link href="/" className="property-listing__breadcrumb-link">Home</Link>
          <ChevronRight className="property-listing__breadcrumb-icon" />
          <span className="property-listing__breadcrumb-current">
            {isViewingLands ? "Lands" : "Properties"}
          </span>
        </div>

        {/* HeaderText with Filters in Action Section */}
        <HeaderText
          title={isViewingLands ? "Land Listings" : "Property Listings"}
          subtitle={isViewingLands ? "explore lands" : "explore properties"}
          alignment="left"
          actionContent={
            <div className="property-listing__header-actions">
              {/* Sort */}
              <select
                className="property-listing__sort"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>

              {/* View Toggle */}
              <div className="property-listing__view-toggle">
                <button
                  className={`property-listing__view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                >
                  <Grid size={20} />
                </button>
                <button
                  className={`property-listing__view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                >
                  <List size={20} />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                className="property-listing__filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
                aria-label="Toggle filters"
              >
                <SlidersHorizontal size={20} />
                {hasActiveFilters && <span className="property-listing__filter-badge"></span>}
              </button>
            </div>
          }
        />

        {/* Results Count */}
        <div className="property-listing__results-count">
          <p className="property-listing__subtitle">
            {total > 0 
              ? `Found ${total} ${total === 1 ? (isViewingLands ? 'land' : 'property') : (isViewingLands ? 'lands' : 'properties')}` 
              : (isViewingLands ? 'No lands found' : 'No properties found')}
          </p>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="property-listing__filter-chips">
            {getActiveFilterChips().map((chip) => (
              <div key={chip.key} className="property-listing__filter-chip">
                <span className="property-listing__filter-chip-label">{chip.label}</span>
                <button
                  className="property-listing__filter-chip-close"
                  onClick={() => removeFilter(chip.key as keyof FilterParams, chip.removeKeys)}
                  aria-label={`Remove ${chip.key} filter`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {hasActiveFilters && (
              <button
                className="property-listing__filter-chip-clear"
                onClick={clearFilters}
                aria-label="Clear all filters"
              >
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Filters Sidebar */}
        {showFilters && (
          <div className="property-listing__filters-wrapper">
            <div className="property-listing__filters-overlay" onClick={() => setShowFilters(false)}></div>
            <div className="property-listing__filters-sidebar">
              <div className="property-listing__filters-header">
                <h2>Filters</h2>
                <button
                  className="property-listing__filters-close"
                  onClick={() => setShowFilters(false)}
                  aria-label="Close filters"
                >
                  <X size={24} />
                </button>
              </div>
              <AdvancedFilter
                filters={filters as any}
                onFilterChange={handleFilterChange as any}
                onClearFilters={clearFilters}
                isViewingLands={isViewingLands}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="property-listing__loading">
            <div className="property-listing__loading-spinner"></div>
            <p>{isViewingLands ? "Loading lands..." : "Loading properties..."}</p>
          </div>
        ) : error ? (
          <div className="property-listing__error">
            <p>{error}</p>
            <button onClick={fetchProperties}>Try Again</button>
          </div>
        ) : properties.length === 0 ? (
          <div className="property-listing__empty">
            <p>{isViewingLands ? "No lands found matching your criteria." : "No properties found matching your criteria."}</p>
            {hasActiveFilters && (
              <button onClick={clearFilters}>Clear Filters</button>
            )}
          </div>
        ) : (
          <>
            <div
              ref={gridRef}
              className={`property-listing__grid property-listing__grid--${viewMode}`}
            >
              {properties.map((property) => (
                <PropertyCardUiModern key={property.id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="property-listing__pagination">
                <button
                  className="property-listing__pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <div className="property-listing__pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => {
                      // Add ellipsis
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      return (
                        <span key={page}>
                          {showEllipsis && <span className="property-listing__pagination-ellipsis">...</span>}
                          <button
                            className={`property-listing__pagination-number ${
                              currentPage === page ? "active" : ""
                            }`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </span>
                      );
                    })}
                </div>
                <button
                  className="property-listing__pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
