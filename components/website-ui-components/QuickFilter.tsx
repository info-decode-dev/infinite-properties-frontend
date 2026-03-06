"use client";

import { useState, useEffect } from "react";
import { MapPin, Home, Building2 } from "lucide-react";
import { BHKType, ConstructionStatus } from "@/types/property";
import apiClient from "@/lib/api";

interface FilterData {
  location: string;
  bhkType: string;
  constructionStatus: string;
  minPrice: string;
  maxPrice: string;
}

interface QuickFilterProps {
  onFilterChange?: (filters: FilterData) => void;
}

interface LocationTag {
  location: string;
  count: number;
}

interface BHKTag {
  bhkType: string;
  count: number;
}

const BHK_OPTIONS: BHKType[] = ["Studio", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"];
const CONSTRUCTION_STATUS_OPTIONS: ConstructionStatus[] = [
  "Ready to Move",
  "Under Construction",
  "Pre-Launch",
];

export default function QuickFilter({ onFilterChange }: QuickFilterProps) {
  const [filters, setFilters] = useState<FilterData>({
    location: "",
    bhkType: "",
    constructionStatus: "",
    minPrice: "",
    maxPrice: "",
  });

  const [locations, setLocations] = useState<string[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [locationTags, setLocationTags] = useState<LocationTag[]>([]);
  const [bhkTags, setBhkTags] = useState<BHKTag[]>([]);

  useEffect(() => {
    fetchLocations();
    fetchQuickTags();
  }, []);

  const fetchLocations = async () => {
    try {
      setIsLoadingLocations(true);
      const response = await apiClient.get("/api/properties/public");
      if (response.data.success) {
        // Extract unique cities from properties
        const cities: string[] = response.data.data
          .map((p: { location?: { city?: string } }) => p.location?.city)
          .filter((city: string | undefined): city is string => Boolean(city));
        
        const uniqueCities = Array.from(new Set(cities));
        setLocations(uniqueCities.sort());
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      // Only log error if it's not a 404
      if (error.response?.status !== 404) {
        console.error("Error fetching locations:", err);
      }
      // Set empty locations on error
      setLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const fetchQuickTags = async () => {
    try {
      const response = await apiClient.get("/api/properties/public");
      if (response.data.success) {
        const properties = response.data.data;
        
        // Count properties by location only
        const locationCounts = new Map<string, { location: string; count: number; createdAt?: Date }>();
        
        // Count properties by BHK type only
        const bhkCounts = new Map<string, { bhkType: string; count: number }>();
        
        properties.forEach((p: {
          location?: { city?: string };
          bhkType?: string;
          createdAt?: Date;
        }) => {
          // Count by location
          const city = p.location?.city;
          if (city) {
            const existing = locationCounts.get(city);
            if (existing) {
              existing.count++;
              if (p.createdAt && (!existing.createdAt || new Date(p.createdAt) > new Date(existing.createdAt))) {
                existing.createdAt = new Date(p.createdAt);
              }
            } else {
              locationCounts.set(city, {
                location: city,
                count: 1,
                createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
              });
            }
          }
          
          // Count by BHK type
          const bhkType = p.bhkType;
          if (bhkType) {
            const existing = bhkCounts.get(bhkType);
            if (existing) {
              existing.count++;
            } else {
              bhkCounts.set(bhkType, {
                bhkType: bhkType,
                count: 1,
              });
            }
          }
        });

        // Process location tags
        let locationTagsList: LocationTag[] = Array.from(locationCounts.values())
          .map(({ location, count }) => ({ location, count }));

        // Filter: show only locations with more than 4 properties
        const popularLocations = locationTagsList.filter(tag => tag.count > 4);
        
        if (popularLocations.length > 0) {
          // Sort by count descending
          locationTagsList = popularLocations.sort((a, b) => b.count - a.count);
        } else {
          // If none have more than 4, show 5 latest added locations
          const locationMap = new Map<string, Date>();
          Array.from(locationCounts.entries()).forEach(([location, data]) => {
            if (data.createdAt) {
              locationMap.set(location, data.createdAt);
            }
          });

          const latestLocations = Array.from(locationMap.entries())
            .sort((a, b) => b[1].getTime() - a[1].getTime())
            .slice(0, 5)
            .map(([location]) => location);

          locationTagsList = latestLocations
            .map(location => {
              const data = locationCounts.get(location);
              return data ? { location: data.location, count: data.count } : null;
            })
            .filter((tag): tag is LocationTag => tag !== null);
        }

        // Process BHK tags
        let bhkTagsList: BHKTag[] = Array.from(bhkCounts.values())
          .map(({ bhkType, count }) => ({ bhkType, count }));

        // Filter: show only BHK types with more than 4 properties
        const popularBHKs = bhkTagsList.filter(tag => tag.count > 4);
        
        if (popularBHKs.length > 0) {
          // Sort by count descending
          bhkTagsList = popularBHKs.sort((a, b) => b.count - a.count);
        } else {
          // If none have more than 4, show all BHK types sorted by count
          bhkTagsList = bhkTagsList.sort((a, b) => b.count - a.count);
        }

        setLocationTags(locationTagsList);
        setBhkTags(bhkTagsList);
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      // Only log error if it's not a 404
      if (error.response?.status !== 404) {
        console.error("Error fetching quick tags:", err);
      }
      // Set empty tags on error
      setLocationTags([]);
      setBhkTags([]);
    }
  };

  const handleFilterChange = (field: keyof FilterData, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleLocationTagClick = (location: string) => {
    const newFilters = {
      ...filters,
      location,
    };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleBHKTagClick = (bhkType: string) => {
    const newFilters = {
      ...filters,
      bhkType,
    };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterData = {
      location: "",
      bhkType: "",
      constructionStatus: "",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const hasActiveFilters = 
    filters.location !== "" ||
    filters.bhkType !== "" ||
    filters.constructionStatus !== "" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "";

  return (
    <div>
      <div className="quick-filter">
      <div className="quick-filter__container">
        {/* Location */}
        <div className="quick-filter__field">
          <MapPin className="quick-filter__icon" />
          <select
            className="quick-filter__select"
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
          >
            <option value="">All Locations</option>
            {isLoadingLocations ? (
              <option value="">Loading...</option>
            ) : (
              locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))
            )}
          </select>
        </div>

        {/* BHK Type */}
        <div className="quick-filter__field">
          <Home className="quick-filter__icon" />
          <select
            className="quick-filter__select"
            value={filters.bhkType}
            onChange={(e) => handleFilterChange("bhkType", e.target.value)}
          >
            <option value="">All BHK Types</option>
            {BHK_OPTIONS.map((bhk) => (
              <option key={bhk} value={bhk}>
                {bhk}
              </option>
            ))}
          </select>
        </div>

        {/* Construction Status */}
        <div className="quick-filter__field">
          <Building2 className="quick-filter__icon" />
          <select
            className="quick-filter__select"
            value={filters.constructionStatus}
            onChange={(e) => handleFilterChange("constructionStatus", e.target.value)}
          >
            <option value="">All Construction Status</option>
            {CONSTRUCTION_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="quick-filter__field">
          <span className="quick-filter__icon" style={{ fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>₹</span>
          <input
            className="quick-filter__input"
            type="text"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
          />
          <input
            className="quick-filter__input"
            type="text"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
          />
        </div>
       
      </div>

      <button className="quick-filter__button">Search</button>
    </div>

    {/* quick filter tags */}
    {(locationTags.length > 0 || bhkTags.length > 0) && (
      <div className="quick-filter__tags-container">
        <div className="quick-filter__tags">
          {/* Location Tags */}
          {locationTags.map((tag, index) => (
            <button
              key={`location-${tag.location}-${index}`}
              className="quick-filter__tag"
              onClick={() => handleLocationTagClick(tag.location)}
            >
              <MapPin className="quick-filter__tag-icon" />
              <span className="quick-filter__tag-text">{tag.location}</span>
              <span className="quick-filter__tag-count">{tag.count}</span>
            </button>
          ))}

          {/* BHK Tags */}
          {bhkTags.map((tag, index) => (
            <button
              key={`bhk-${tag.bhkType}-${index}`}
              className="quick-filter__tag"
              onClick={() => handleBHKTagClick(tag.bhkType)}
            >
              <Home className="quick-filter__tag-icon" />
              <span className="quick-filter__tag-text">{tag.bhkType}</span>
              <span className="quick-filter__tag-count">{tag.count}</span>
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Clear filters link */}
    {hasActiveFilters && (
      <div className="quick-filter__clear-container">
        <button
          className="quick-filter__clear-link"
          onClick={handleClearFilters}
        >
          Clear applied filters
        </button>
      </div>
    )}
    </div>
  );
}
