"use client";

import { useState, useEffect } from "react";
import { MapPin, Home, Building2, DollarSign, Square, X } from "lucide-react";
import { BHKType, ConstructionStatus, PropertyType } from "@/types/property";
import { INDIAN_STATES, INDIAN_CITIES } from "@/constants/indianLocations";
import apiClient from "@/lib/api";

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
  page?: number;
  limit?: number;
  sort?: string;
}

interface AdvancedFilterProps {
  filters: FilterParams;
  onFilterChange: (filters: Partial<FilterParams>) => void;
  onClearFilters: () => void;
  isViewingLands?: boolean;
}

const BHK_OPTIONS: BHKType[] = ["Studio", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"];
const CONSTRUCTION_STATUS_OPTIONS: ConstructionStatus[] = [
  "Ready to Move",
  "Under Construction",
  "Pre-Launch",
];
const PROPERTY_TYPE_OPTIONS: PropertyType[] = [
  "Home",
  "Villa",
  "Flat",
  "Apartment",
  "Plot",
  "Commercial",
  "Farmhouse",
];
const LAND_TYPE_OPTIONS = [
  "Residential",
  "Commercial",
  "Agricultural",
  "Industrial",
  "Resort Land",
];

const PRICE_RANGES = [
  { label: "Any Price", min: "", max: "" },
  { label: "Under ₹50 Lakhs", min: "0", max: "5000000" },
  { label: "₹50 Lakhs - ₹1 Crore", min: "5000000", max: "10000000" },
  { label: "₹1 Crore - ₹2 Crores", min: "10000000", max: "20000000" },
  { label: "₹2 Crores - ₹5 Crores", min: "20000000", max: "50000000" },
  { label: "Above ₹5 Crores", min: "50000000", max: "" },
];

export default function AdvancedFilter({
  filters,
  onFilterChange,
  onClearFilters,
  isViewingLands = false,
}: AdvancedFilterProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [selectedState, setSelectedState] = useState(filters.state || "");
  const [selectedCity, setSelectedCity] = useState(filters.city || "");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    filters.amenities || []
  );
  const [selectedLandType, setSelectedLandType] = useState(filters.landType || "");
  const [priceRange, setPriceRange] = useState(
    filters.minPrice || filters.maxPrice
      ? ""
      : PRICE_RANGES.find(
          (r) => r.min === filters.minPrice && r.max === filters.maxPrice
        )?.label || ""
  );
  const [customMinPrice, setCustomMinPrice] = useState(filters.minPrice || "");
  const [customMaxPrice, setCustomMaxPrice] = useState(filters.maxPrice || "");

  useEffect(() => {
    fetchAmenities();
  }, []);

  // Sync local state with filters prop (when filters change from URL or other sources)
  useEffect(() => {
    setSearchQuery(filters.search || "");
    setSelectedState(filters.state || "");
    setSelectedCity(filters.city || "");
    setSelectedAmenities(filters.amenities || []);
    setSelectedLandType(filters.landType || "");
    
    // Sync price range
    const minPriceStr = filters.minPrice || "";
    const maxPriceStr = filters.maxPrice || "";
    const matchingRange = PRICE_RANGES.find(
      (r) => (r.min || "") === minPriceStr && (r.max || "") === maxPriceStr
    );
    if (matchingRange) {
      setPriceRange(matchingRange.label);
      setCustomMinPrice(matchingRange.min);
      setCustomMaxPrice(matchingRange.max);
    } else if (filters.minPrice || filters.maxPrice) {
      setPriceRange("");
      setCustomMinPrice(filters.minPrice || "");
      setCustomMaxPrice(filters.maxPrice || "");
    } else {
      setPriceRange("");
      setCustomMinPrice("");
      setCustomMaxPrice("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.state, filters.city, filters.amenities, filters.landType, filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    if (selectedState) {
      const cities = INDIAN_CITIES[selectedState] || [];
      setAvailableCities(cities);
      if (!cities.includes(selectedCity)) {
        setSelectedCity("");
        onFilterChange({ city: undefined });
      }
    } else {
      setAvailableCities([]);
      setSelectedCity("");
    }
  }, [selectedState]);

  const fetchAmenities = async () => {
    try {
      const response = await apiClient.get("/api/properties/public");
      if (response.data.success) {
        const amenitiesSet = new Set<string>();
        response.data.data.forEach((p: { amenities?: { name: string }[] }) => {
          if (p.amenities) {
            p.amenities.forEach((amenity) => {
              amenitiesSet.add(amenity.name);
            });
          }
        });
        setAvailableAmenities(Array.from(amenitiesSet).sort());
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      // Only log error if it's not a 404
      if (error.response?.status !== 404) {
        console.error("Error fetching amenities:", err);
      }
      // Set empty amenities on error
      setAvailableAmenities([]);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFilterChange({ search: value || undefined });
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    onFilterChange({ state: state || undefined, city: undefined });
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    onFilterChange({ city: city || undefined });
  };

  const handleBHKChange = (bhk: string) => {
    onFilterChange({ bhkType: bhk || undefined });
  };

  const handlePropertyTypeChange = (type: string) => {
    onFilterChange({ propertyType: type || undefined });
  };

  const handleConstructionStatusChange = (status: string) => {
    onFilterChange({ constructionStatus: status || undefined });
  };

  const handleLandTypeChange = (landType: string) => {
    onFilterChange({ landType: landType || undefined });
  };

  const handlePriceRangeChange = (range: string) => {
    setPriceRange(range);
    const selectedRange = PRICE_RANGES.find((r) => r.label === range);
    if (selectedRange) {
      setCustomMinPrice(selectedRange.min);
      setCustomMaxPrice(selectedRange.max);
      onFilterChange({
        minPrice: selectedRange.min || undefined,
        maxPrice: selectedRange.max || undefined,
      });
    }
  };

  const handleCustomPriceChange = (type: "min" | "max", value: string) => {
    if (type === "min") {
      setCustomMinPrice(value);
      onFilterChange({ minPrice: value || undefined });
    } else {
      setCustomMaxPrice(value);
      onFilterChange({ maxPrice: value || undefined });
    }
    setPriceRange("");
  };

  const handleAreaChange = (type: "min" | "max", value: string) => {
    onFilterChange({
      [type === "min" ? "minArea" : "maxArea"]: value || undefined,
    });
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(newAmenities);
    onFilterChange({ amenities: newAmenities.length > 0 ? newAmenities : undefined });
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.city) ||
    Boolean(filters.state) ||
    Boolean(filters.bhkType) ||
    Boolean(filters.propertyType) ||
    Boolean(filters.constructionStatus) ||
    Boolean(filters.landType) ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    Boolean(filters.minArea) ||
    Boolean(filters.maxArea) ||
    (filters.amenities && filters.amenities.length > 0);

  return (
    <div className="advanced-filter">
      {/* Search */}
      <div className="advanced-filter__section">
        <label className="advanced-filter__label">Search</label>
        <input
          type="text"
          className="advanced-filter__input"
          placeholder="Search by title or description..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Location */}
      <div className="advanced-filter__section">
        <label className="advanced-filter__label">
          <MapPin size={18} />
          Location
        </label>
        <div className="advanced-filter__row">
          <select
            className="advanced-filter__select"
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <select
            className="advanced-filter__select"
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={!selectedState}
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

      {/* Conditional: Property Type for Properties, Land Type for Lands */}
      {isViewingLands ? (
        /* Land Type */
        <div className="advanced-filter__section">
          <label className="advanced-filter__label">
            <Home size={18} />
            Land Type
          </label>
          <div className="advanced-filter__chips">
            <button
              className={`advanced-filter__chip ${
                !selectedLandType ? "active" : ""
              }`}
              onClick={() => handleLandTypeChange("")}
            >
              All
            </button>
            {LAND_TYPE_OPTIONS.map((landType) => (
              <button
                key={landType}
                className={`advanced-filter__chip ${
                  selectedLandType === landType ? "active" : ""
                }`}
                onClick={() => handleLandTypeChange(landType)}
              >
                {landType}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Property Type */}
          <div className="advanced-filter__section">
            <label className="advanced-filter__label">
              <Home size={18} />
              Property Type
            </label>
            <div className="advanced-filter__chips">
              <button
                className={`advanced-filter__chip ${
                  !filters.propertyType ? "active" : ""
                }`}
                onClick={() => handlePropertyTypeChange("")}
              >
                All
              </button>
              {PROPERTY_TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  className={`advanced-filter__chip ${
                    filters.propertyType === type ? "active" : ""
                  }`}
                  onClick={() => handlePropertyTypeChange(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* BHK Type */}
          <div className="advanced-filter__section">
            <label className="advanced-filter__label">
              <Building2 size={18} />
              BHK Type
            </label>
            <div className="advanced-filter__chips">
              <button
                className={`advanced-filter__chip ${
                  !filters.bhkType ? "active" : ""
                }`}
                onClick={() => handleBHKChange("")}
              >
                All
              </button>
              {BHK_OPTIONS.map((bhk) => (
                <button
                  key={bhk}
                  className={`advanced-filter__chip ${
                    filters.bhkType === bhk ? "active" : ""
                  }`}
                  onClick={() => handleBHKChange(bhk)}
                >
                  {bhk}
                </button>
              ))}
            </div>
          </div>

          {/* Construction Status */}
          <div className="advanced-filter__section">
            <label className="advanced-filter__label">
              <Building2 size={18} />
              Construction Status
            </label>
            <div className="advanced-filter__chips">
              <button
                className={`advanced-filter__chip ${
                  !filters.constructionStatus ? "active" : ""
                }`}
                onClick={() => handleConstructionStatusChange("")}
              >
                All
              </button>
              {CONSTRUCTION_STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  className={`advanced-filter__chip ${
                    filters.constructionStatus === status ? "active" : ""
                  }`}
                  onClick={() => handleConstructionStatusChange(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Price Range */}
      <div className="advanced-filter__section">
        <label className="advanced-filter__label">
          <DollarSign size={18} />
          Price Range
        </label>
        <select
          className="advanced-filter__select"
          value={priceRange}
          onChange={(e) => handlePriceRangeChange(e.target.value)}
        >
          {PRICE_RANGES.map((range) => (
            <option key={range.label} value={range.label}>
              {range.label}
            </option>
          ))}
        </select>
        <div className="advanced-filter__row">
          <input
            type="number"
            className="advanced-filter__input"
            placeholder="Min Price (₹)"
            value={customMinPrice}
            onChange={(e) => handleCustomPriceChange("min", e.target.value)}
          />
          <input
            type="number"
            className="advanced-filter__input"
            placeholder="Max Price (₹)"
            value={customMaxPrice}
            onChange={(e) => handleCustomPriceChange("max", e.target.value)}
          />
        </div>
      </div>

      {/* Area Range / Plot Size */}
      <div className="advanced-filter__section">
        <label className="advanced-filter__label">
          <Square size={18} />
          {isViewingLands ? "Plot Size" : "Area (sq. ft.)"}
        </label>
        <div className="advanced-filter__row">
          <input
            type="number"
            className="advanced-filter__input"
            placeholder={isViewingLands ? "Min Size (cents)" : "Min Area"}
            value={filters.minArea || ""}
            onChange={(e) => handleAreaChange("min", e.target.value)}
          />
          <input
            type="number"
            className="advanced-filter__input"
            placeholder={isViewingLands ? "Max Size (cents)" : "Max Area"}
            value={filters.maxArea || ""}
            onChange={(e) => handleAreaChange("max", e.target.value)}
          />
        </div>
        {isViewingLands && (
          <p className="advanced-filter__hint" style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.5rem" }}>
            Note: Enter size in cents (1 acre = 100 cents)
          </p>
        )}
      </div>

      {/* Amenities */}
      {availableAmenities.length > 0 && (
        <div className="advanced-filter__section">
          <label className="advanced-filter__label">Amenities</label>
          <div className="advanced-filter__amenities">
            {availableAmenities.map((amenity) => (
              <label key={amenity} className="advanced-filter__amenity">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="advanced-filter__actions">
          <button
            className="advanced-filter__clear-btn"
            onClick={onClearFilters}
          >
            <X size={18} />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
