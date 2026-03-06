"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { BHKType, ConstructionStatus } from "@/types/property";
import apiClient from "@/lib/api";

interface FilterData {
  location: string;
  bhkType: string;
  constructionStatus: string;
  price: string;
  priceType?: "above" | "below";
  customPrice?: string;
  landType?: string;
  plotSize?: string;
}

interface HeroFilterProps {
  propertyType?: "properties" | "lands";
  onFilterChange?: (filters: FilterData) => void;
}

const BHK_OPTIONS: BHKType[] = ["Studio", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"];
const CONSTRUCTION_STATUS_OPTIONS: ConstructionStatus[] = [
  "Ready to Move",
  "Under Construction",
  "Pre-Launch",
];

const LAND_TYPE_OPTIONS = [
  "Residential",
  "Commercial",
  "Agricultural",
  "Industrial",
  "Resort Land",
];

const PLOT_SIZE_OPTIONS = [
  "Any Size",
  "Under 5 Cents",
  "5 - 10 Cents",
  "10 - 25 Cents",
  "25 - 50 Cents",
  "50 Cents - 1 Acre",
  "Above 1 Acre",
];

const PRICE_OPTIONS = [
  "Any Price",
  "Under ₹50 Lakhs",
  "₹50 Lakhs - ₹1 Crore",
  "₹1 Crore - ₹2 Crores",
  "₹2 Crores - ₹5 Crores",
  "Above ₹5 Crores",
];

export default function HeroFilter({ propertyType = "properties", onFilterChange }: HeroFilterProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterData>({
    location: "",
    bhkType: "",
    constructionStatus: "",
    price: "",
    priceType: undefined,
    customPrice: "",
    landType: "",
    plotSize: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isOpen, setIsOpen] = useState({
    location: false,
    bhkType: false,
    constructionStatus: false,
    price: false,
    landType: false,
    plotSize: false,
  });

  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  const bhkDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const landTypeDropdownRef = useRef<HTMLDivElement>(null);
  const plotSizeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  // Reset filters when propertyType changes
  useEffect(() => {
    setFilters({
      location: "",
      bhkType: "",
      constructionStatus: "",
      price: "",
      priceType: undefined,
      customPrice: "",
      landType: "",
      plotSize: "",
    });
    setIsOpen({
      location: false,
      bhkType: false,
      constructionStatus: false,
      price: false,
      landType: false,
      plotSize: false,
    });
  }, [propertyType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(target)) {
        setIsOpen(prev => ({ ...prev, location: false }));
      }
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(target)) {
        setIsOpen(prev => ({ ...prev, price: false }));
      }
      if (bhkDropdownRef.current && !bhkDropdownRef.current.contains(target)) {
        setIsOpen(prev => ({ ...prev, bhkType: false }));
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(target)) {
        setIsOpen(prev => ({ ...prev, constructionStatus: false }));
      }
      if (landTypeDropdownRef.current && !landTypeDropdownRef.current.contains(target)) {
        setIsOpen(prev => ({ ...prev, landType: false }));
      }
      if (plotSizeDropdownRef.current && !plotSizeDropdownRef.current.contains(target)) {
        setIsOpen(prev => ({ ...prev, plotSize: false }));
      }
    };

    if (isOpen.location || isOpen.bhkType || isOpen.constructionStatus || isOpen.price || isOpen.landType || isOpen.plotSize) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const fetchLocations = async () => {
    try {
      setIsLoadingLocations(true);
      const response = await apiClient.get("/api/properties/public");
      if (response.data.success) {
        const cities: string[] = response.data.data
          .map((p: { location?: { city?: string } }) => p.location?.city)
          .filter((city: string | undefined): city is string => Boolean(city));
        
        const uniqueCities = Array.from(new Set(cities));
        setLocations(uniqueCities.sort());
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      // Only log error if it's not a 404 (404 might mean server is not running)
      if (error.response?.status !== 404) {
      console.error("Error fetching locations:", err);
      }
      // Set empty locations array on error
      setLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const handleFilterChange = (field: keyof FilterData, value: string | undefined, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    setIsOpen({ location: false, bhkType: false, constructionStatus: false, price: false, landType: false, plotSize: false });
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handlePriceChange = (price: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const newFilters = { ...filters, price: price === "Any Price" ? "" : price, priceType: undefined, customPrice: "" };
    setFilters(newFilters);
    setIsOpen({ location: false, bhkType: false, constructionStatus: false, price: false, landType: false, plotSize: false });
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handlePlotSizeChange = (plotSize: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const newFilters = { ...filters, plotSize: plotSize === "Any Size" ? "" : plotSize };
    setFilters(newFilters);
    setIsOpen({ location: false, bhkType: false, constructionStatus: false, price: false, landType: false, plotSize: false });
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleCheck = () => {
    const params = new URLSearchParams();
    
    if (filters.location && filters.location.trim()) {
      params.append("city", filters.location.trim());
    }
    
    if (propertyType === "properties") {
      // Property filters
      if (filters.bhkType && filters.bhkType.trim()) {
        params.append("bhkType", filters.bhkType.trim());
      }
      if (filters.constructionStatus && filters.constructionStatus.trim()) {
        params.append("constructionStatus", filters.constructionStatus.trim());
      }
    } else {
      // Land filters
      if (filters.landType && filters.landType.trim()) {
        params.append("landType", filters.landType.trim());
      }
      if (filters.plotSize && filters.plotSize !== "Any Size" && filters.plotSize.trim()) {
        // Parse plot size ranges (convert to square meters or keep as cents/acre)
        // For now, we'll pass the range as a parameter that can be parsed on the backend
        if (filters.plotSize === "Under 5 Cents") {
          params.append("maxArea", "5");
          params.append("areaUnit", "cent");
        } else if (filters.plotSize === "5 - 10 Cents") {
          params.append("minArea", "5");
          params.append("maxArea", "10");
          params.append("areaUnit", "cent");
        } else if (filters.plotSize === "10 - 25 Cents") {
          params.append("minArea", "10");
          params.append("maxArea", "25");
          params.append("areaUnit", "cent");
        } else if (filters.plotSize === "25 - 50 Cents") {
          params.append("minArea", "25");
          params.append("maxArea", "50");
          params.append("areaUnit", "cent");
        } else if (filters.plotSize === "50 Cents - 1 Acre") {
          // 1 acre = 100 cents, so this is 50 cents to 100 cents (1 acre)
          params.append("minArea", "50");
          params.append("maxArea", "100");
          params.append("areaUnit", "cent");
        } else if (filters.plotSize === "Above 1 Acre") {
          params.append("minArea", "1");
          params.append("areaUnit", "acre");
        }
      }
    }
    
    if (filters.price && filters.price !== "Any Price" && filters.price.trim()) {
      // Parse price ranges
      if (filters.price === "Under ₹50 Lakhs") {
        params.append("maxPrice", "5000000");
      } else if (filters.price === "₹50 Lakhs - ₹1 Crore") {
        params.append("minPrice", "5000000");
        params.append("maxPrice", "10000000");
      } else if (filters.price === "₹1 Crore - ₹2 Crores") {
        params.append("minPrice", "10000000");
        params.append("maxPrice", "20000000");
      } else if (filters.price === "₹2 Crores - ₹5 Crores") {
        params.append("minPrice", "20000000");
        params.append("maxPrice", "50000000");
      } else if (filters.price === "Above ₹5 Crores") {
        params.append("minPrice", "50000000");
      }
    }

    // Add propertyType to indicate we're filtering lands
    if (propertyType === "lands") {
      params.append("propertyType", "Plot");
    }

    const queryString = params.toString();
    router.push(queryString ? `/properties?${queryString}` : "/properties", { scroll: true });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.append("search", searchQuery.trim());
      router.push(`/properties?${params.toString()}`, { scroll: true });
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const filteredLocations = locations.filter(loc =>
    loc.toLowerCase().includes(locationSearch.toLowerCase())
  );

  return (
    <div className="hero-filter-container">
      {/* Mobile Search Bar */}
      <div className="hero-filter-search-mobile">
        <input
          type="text"
          placeholder={propertyType === "properties" ? "Search properties..." : "Search lands..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          className="hero-filter-search-input"
        />
        <button
          onClick={handleSearch}
          className="hero-filter-search-button"
          aria-label="Search"
        >
          <Search className="hero-filter-search-icon" />
        </button>
      </div>

      {/* Desktop Filter Bar */}
      <div className="hero-filter-bar">
        {/* Location */}
        <div className="hero-filter-field" ref={locationDropdownRef}>
          <div 
            className="hero-filter-label"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(prev => {
                const newState = { location: !prev.location, bhkType: false, constructionStatus: false, price: false, landType: false, plotSize: false };
                return newState;
              });
            }}
          >
            <span>{filters.location || "Location"}</span>
            <ChevronDown className="hero-filter-chevron" />
          </div>
          {isOpen.location && (
            <div className="hero-filter-dropdown hero-filter-dropdown--location">
              <div className="hero-filter-search-box" onClick={(e) => e.stopPropagation()}>
                <Search className="hero-filter-search-icon-small" />
                <input
                  type="text"
                  placeholder="Search location..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="hero-filter-search-input-dropdown"
                />
              </div>
              <div className="hero-filter-options-list" onClick={(e) => e.stopPropagation()}>
              <div
                className="hero-filter-option"
                  onClick={(e) => handleFilterChange("location", "", e)}
              >
                All Locations
              </div>
              {isLoadingLocations ? (
                <div className="hero-filter-option">Loading...</div>
                ) : filteredLocations.length > 0 ? (
                  filteredLocations.map((location) => (
                  <div
                    key={location}
                    className="hero-filter-option"
                      onClick={(e) => handleFilterChange("location", location, e)}
                  >
                    {location}
                  </div>
                ))
                ) : (
                  <div className="hero-filter-option">No locations found</div>
              )}
              </div>
            </div>
          )}
        </div>

        <div className="hero-filter-separator"></div>

        {/* Conditional: BHK Type for Properties, Land Type for Lands */}
        {propertyType === "properties" ? (
          <>
            {/* BHK Type */}
            <div className="hero-filter-field" ref={bhkDropdownRef}>
              <div 
                className="hero-filter-label"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(prev => {
                    const newState = { location: false, bhkType: !prev.bhkType, constructionStatus: false, price: false, landType: false, plotSize: false };
                    return newState;
                  });
                }}
              >
                <span>{filters.bhkType || "BHK Types"}</span>
                <ChevronDown className="hero-filter-chevron" />
              </div>
              {isOpen.bhkType && (
                <div className="hero-filter-dropdown">
                  <div
                    className="hero-filter-option"
                    onClick={(e) => handleFilterChange("bhkType", "", e)}
                  >
                    All BHK Types
                  </div>
                  {BHK_OPTIONS.map((bhk) => (
                    <div
                      key={bhk}
                      className="hero-filter-option"
                      onClick={(e) => handleFilterChange("bhkType", bhk, e)}
                    >
                      {bhk}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hero-filter-separator"></div>

            {/* Construction Status */}
            <div className="hero-filter-field" ref={statusDropdownRef}>
              <div 
                className="hero-filter-label"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(prev => {
                    const newState = { location: false, bhkType: false, constructionStatus: !prev.constructionStatus, price: false, landType: false, plotSize: false };
                    return newState;
                  });
                }}
              >
                <span>{filters.constructionStatus || "Construction Status"}</span>
                <ChevronDown className="hero-filter-chevron" />
              </div>
              {isOpen.constructionStatus && (
                <div className="hero-filter-dropdown">
                  <div
                    className="hero-filter-option"
                    onClick={(e) => handleFilterChange("constructionStatus", "", e)}
                  >
                    All Construction Status
                  </div>
                  {CONSTRUCTION_STATUS_OPTIONS.map((status) => (
                    <div
                      key={status}
                      className="hero-filter-option"
                      onClick={(e) => handleFilterChange("constructionStatus", status, e)}
                    >
                      {status}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Land Type */}
            <div className="hero-filter-field" ref={landTypeDropdownRef}>
              <div 
                className="hero-filter-label"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(prev => {
                    const newState = { location: false, bhkType: false, constructionStatus: false, price: false, landType: !prev.landType, plotSize: false };
                    return newState;
                  });
                }}
              >
                <span>{filters.landType || "Land Type"}</span>
                <ChevronDown className="hero-filter-chevron" />
              </div>
              {isOpen.landType && (
                <div className="hero-filter-dropdown">
                  <div
                    className="hero-filter-option"
                    onClick={(e) => handleFilterChange("landType", "", e)}
                  >
                    All Land Types
                  </div>
                  {LAND_TYPE_OPTIONS.map((landType) => (
                    <div
                      key={landType}
                      className="hero-filter-option"
                      onClick={(e) => handleFilterChange("landType", landType, e)}
                    >
                      {landType}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hero-filter-separator"></div>

            {/* Plot Size */}
            <div className="hero-filter-field" ref={plotSizeDropdownRef}>
              <div 
                className="hero-filter-label"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(prev => {
                    const newState = { location: false, bhkType: false, constructionStatus: false, price: false, landType: false, plotSize: !prev.plotSize };
                    return newState;
                  });
                }}
              >
                <span>{filters.plotSize || "Plot Size"}</span>
                <ChevronDown className="hero-filter-chevron" />
              </div>
              {isOpen.plotSize && (
                <div className="hero-filter-dropdown">
                  <div className="hero-filter-options-list" onClick={(e) => e.stopPropagation()}>
                    {PLOT_SIZE_OPTIONS.map((plotSize) => (
                      <div
                        key={plotSize}
                        className="hero-filter-option"
                        onClick={(e) => handlePlotSizeChange(plotSize, e)}
                      >
                        {plotSize}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div className="hero-filter-separator"></div>

        {/* Price */}
        <div className="hero-filter-field" ref={priceDropdownRef}>
          <div 
            className="hero-filter-label"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(prev => {
                const newState = { location: false, bhkType: false, constructionStatus: false, price: !prev.price, landType: false, plotSize: false };
                return newState;
              });
            }}
          >
            <span>{filters.price || "Price"}</span>
            <ChevronDown className="hero-filter-chevron" />
          </div>
          {isOpen.price && (
            <div className="hero-filter-dropdown hero-filter-dropdown--price">
              <div className="hero-filter-options-list" onClick={(e) => e.stopPropagation()}>
              {PRICE_OPTIONS.map((price) => (
                <div
                  key={price}
                  className="hero-filter-option"
                    onClick={(e) => handlePriceChange(price, e)}
                >
                  {price}
                </div>
              ))}
              </div>
            </div>
          )}
        </div>

        {/* Check Button */}
        <button className="hero-filter-button" onClick={handleCheck}>
          Check
        </button>
      </div>
    </div>
  );
}
