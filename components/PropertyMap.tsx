"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import DottedMap from "dotted-map";
import { Property } from "@/types/property";
import { MapPin } from "lucide-react";
import HeaderText from "./website-ui-components/HeaderText";
import { INDIAN_STATES } from "@/constants/indianLocations";
import gsap from "gsap";

interface PropertyMapProps {
  properties?: Property[];
  height?: string;
  onPropertyClick?: (property: Property) => void;
  className?: string;
}

// South India bounding box coordinates
const SOUTH_INDIA_BOUNDS = {
  north: 20.5,
  south: 8.0,
  east: 84.0,
  west: 72.0,
};

// Center of South India
const SOUTH_INDIA_CENTER = {
  lat: 13.5,
  lng: 78.0,
};

// Property availability states
type PropertyStatus = "available" | "sold" | "reserved" | "under-construction";

const getPropertyStatus = (property: Property): PropertyStatus => {
  if (property.constructionStatus === "Ready to Move") {
    return "available";
  } else if (property.constructionStatus === "Under Construction") {
    return "under-construction";
  } else if (property.constructionStatus === "Pre-Launch") {
    return "reserved";
  }
  return "available";
};

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties = [],
  height,
  onPropertyClick,
  className = "",
}) => {
  // Responsive height
  const [mapHeight, setMapHeight] = useState(height || "600px");

  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth < 768) {
        setMapHeight("400px");
      } else if (window.innerWidth < 1024) {
        setMapHeight("500px");
      } else {
        setMapHeight(height || "600px");
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [height]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Filter properties in South India
  const southIndiaProperties = useMemo(() => {
    return properties.filter((property) => {
      if (!property.location.latitude || !property.location.longitude) return false;
      const lat = property.location.latitude;
      const lng = property.location.longitude;
      return (
        lat >= SOUTH_INDIA_BOUNDS.south &&
        lat <= SOUTH_INDIA_BOUNDS.north &&
        lng >= SOUTH_INDIA_BOUNDS.west &&
        lng <= SOUTH_INDIA_BOUNDS.east
      );
    });
  }, [properties]);

  // Get all states that have properties (not just South India)
  const statesWithProperties = useMemo(() => {
    const states = new Set<string>();
    properties.forEach((property) => {
      if (property.location.state) {
        states.add(property.location.state);
      }
    });
    return Array.from(states);
  }, [properties]);

  // Track previous states to detect new additions
  const [previousStates, setPreviousStates] = useState<Set<string>>(new Set());
  const [newlyAddedStates, setNewlyAddedStates] = useState<Set<string>>(new Set());

  // Watch for new states when properties change
  useEffect(() => {
    const currentStates = new Set(statesWithProperties);
    const newStates = new Set<string>();

    // Find newly added states
    currentStates.forEach((state) => {
      if (!previousStates.has(state)) {
        newStates.add(state);
      }
    });

    if (newStates.size > 0) {
      setNewlyAddedStates(newStates);
      // Clear the highlight after 3 seconds
      const timer = setTimeout(() => {
        setNewlyAddedStates(new Set());
      }, 3000);
      return () => clearTimeout(timer);
    }

    setPreviousStates(currentStates);
  }, [statesWithProperties, previousStates]);

  // Animation effect
  useEffect(() => {
    if (!sectionRef.current || !mapWrapperRef.current) return;

    const ctx = gsap.context(() => {
      // Set initial states
      if (headerRef.current) {
        gsap.set(headerRef.current, {
          opacity: 0,
          y: 50,
        });
      }

      if (mapWrapperRef.current) {
        gsap.set(mapWrapperRef.current, {
          opacity: 0,
          y: 60,
          scale: 0.95,
        });
      }

      // Create intersection observer for scroll-triggered animation
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Animate header
              if (headerRef.current) {
                gsap.to(headerRef.current, {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  ease: "power3.out",
                });
              }

              // Animate map wrapper
              if (mapWrapperRef.current) {
                gsap.to(mapWrapperRef.current, {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.6,
                  ease: "power3.out",
                });
              }

              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -100px 0px",
        }
      );

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }, sectionRef);

    return () => ctx.revert();
  }, [properties]);

  // Helper function to check if state has properties
  const stateHasProperties = (stateName: string): boolean => {
    return statesWithProperties.some((state) => {
      const stateLower = state.toLowerCase().trim();
      const nameLower = stateName.toLowerCase().trim();
      return (
        stateLower === nameLower ||
        stateLower.includes(nameLower) ||
        nameLower.includes(stateLower) ||
        // Handle variations
        (stateName === "Tamil Nadu" && stateLower.includes("tamil")) ||
        (stateName === "Andhra Pradesh" && (stateLower.includes("andhra") || stateLower.includes("ap"))) ||
        (stateName === "Telangana" && (stateLower.includes("telangana") || stateLower.includes("tg"))) ||
        (stateName === "Jammu and Kashmir" && (stateLower.includes("jammu") || stateLower.includes("kashmir")))
      );
    });
  };

  // Helper function to check if state is newly added
  const isNewlyAdded = (stateName: string): boolean => {
    return Array.from(newlyAddedStates).some((state) => {
      const stateLower = state.toLowerCase().trim();
      const nameLower = stateName.toLowerCase().trim();
      return (
        stateLower === nameLower ||
        stateLower.includes(nameLower) ||
        nameLower.includes(stateLower)
      );
    });
  };

  // Generate the dotted map focused on India
  const mapSvg = useMemo(() => {
    const map = new DottedMap({
      height: 60,
      grid: "diagonal",
    });

    // Get SVG for India region with secondary color
    const svg = map.getSVG({
      radius: 0.4,
      shape: "circle",
      color: "#005B5C", // Secondary color
    });

    return svg;
  }, []);

  // India's geographic bounds
  const INDIA_BOUNDS = {
    north: 37.0,
    south: 6.0,
    east: 97.0,
    west: 68.0,
  };

  // Convert lat/lng to pixel coordinates - Full world map
  const latLngToPixel = (lat: number, lng: number) => {
    const container = mapContainerRef.current;
    if (!container) return { x: 0, y: 0 };

    const width = container.clientWidth;
    const height = container.clientHeight;

    // World map coordinates: 0-100 width (360° longitude), 0-60 height (180° latitude)
    // Longitude: -180° to 180° maps to 0 to 100
    // Latitude: -90° to 90° maps to 60 to 0 (inverted)
    
    // Convert longitude to X (0-100)
    const worldX = ((lng + 180) / 360) * 100;
    
    // Convert latitude to Y (0-60, inverted)
    const worldY = ((90 - lat) / 180) * 60;

    // Map world coordinates to pixel coordinates
    const padding = 20;
    const mapWidth = width - padding * 2;
    const mapHeight = height - padding * 2;

    return {
      x: padding + (worldX / 100) * mapWidth,
      y: padding + (worldY / 60) * mapHeight,
    };
  };


  // Get status color
  const getStatusColor = (status: PropertyStatus) => {
    switch (status) {
      case "available":
        return "#10b981"; // Green
      case "sold":
        return "#ef4444"; // Red
      case "reserved":
        return "#f59e0b"; // Amber
      case "under-construction":
        return "#3b82f6"; // Blue
      default:
        return "#6b7280"; // Gray
    }
  };

  // Get status label
  const getStatusLabel = (status: PropertyStatus) => {
    switch (status) {
      case "available":
        return "Available";
      case "sold":
        return "Sold";
      case "reserved":
        return "Reserved";
      case "under-construction":
        return "Under Construction";
      default:
        return "Unknown";
    }
  };

  // South India states coordinates (approximate centers for highlighting)
  const southIndiaStates = {
    "Karnataka": { lat: 12.9716, lng: 77.5946, name: "Karnataka", bounds: { north: 18.5, south: 11.5, east: 78.5, west: 74 } },
    "Kerala": { lat: 10.8505, lng: 76.2711, name: "Kerala", bounds: { north: 12.8, south: 8.2, east: 77.3, west: 74.8 } },
    "Tamil Nadu": { lat: 11.1271, lng: 78.6569, name: "Tamil Nadu", bounds: { north: 13.5, south: 8.1, east: 80.3, west: 76.2 } },
    "Andhra Pradesh": { lat: 15.9129, lng: 79.7400, name: "Andhra Pradesh", bounds: { north: 19.9, south: 12.6, east: 84.8, west: 76.2 } },
    "Telangana": { lat: 17.3850, lng: 78.4867, name: "Telangana", bounds: { north: 19.9, south: 15.6, east: 81.3, west: 77.2 } },
  };

  return (
    <div ref={sectionRef} className={`property-map-container ${className}`}>
      {/* Header */}
      <div ref={headerRef}>
        <HeaderText 
          title="Property Locations" 
          subtitle="explore our properties" 
          alignment="center"
        />
      </div>

      {/* States Marquee */}
      <div className="states-marquee-container">
        <div className="states-marquee">
          {/* First set of states */}
          {INDIAN_STATES.map((state, index) => {
            const hasProperties = stateHasProperties(state);
            const isNew = isNewlyAdded(state);
            return (
              <span
                key={`state-1-${index}`}
                className={`state-chip ${hasProperties ? "has-properties" : ""} ${isNew ? "newly-added" : ""}`}
              >
                {state}
                {hasProperties && <span className="chip-indicator"></span>}
              </span>
            );
          })}
          {/* Duplicate for seamless loop */}
          {INDIAN_STATES.map((state, index) => {
            const hasProperties = stateHasProperties(state);
            const isNew = isNewlyAdded(state);
            return (
              <span
                key={`state-2-${index}`}
                className={`state-chip ${hasProperties ? "has-properties" : ""} ${isNew ? "newly-added" : ""}`}
              >
                {state}
                {hasProperties && <span className="chip-indicator"></span>}
              </span>
            );
          })}
        </div>
      </div>
      
      {/* Map Container */}
      <div ref={mapWrapperRef}>
        <div
          ref={mapContainerRef}
          className="map-container"
          style={{ height: mapHeight }}
        >
        <div
          className="map-content"
          style={{
            position: "relative",
          }}
        >
          <svg
            ref={svgRef}
            className="dotted-map-svg"
            viewBox="0 0 100 60"
            preserveAspectRatio="xMidYMid meet"
            dangerouslySetInnerHTML={{ __html: mapSvg }}
          />
          
          {/* India Highlight Overlay */}
          <div className="india-highlight">
            <svg
              className="india-outline"
              viewBox="0 0 100 60"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* India outline path - approximate shape in world map coordinates */}
              {/* India roughly spans: X: 68-77 (longitude), Y: 17-28 (latitude) */}
              <path
                d="M 68.5 28 L 69 27.5 L 69.5 27 L 70 26 L 70.5 25 L 71 24 L 71.5 23 L 72 22 L 72.5 21 L 73 20.5 L 73.5 20 L 74 19.5 L 74.5 19 L 75 18.5 L 75.5 18 L 76 17.5 L 76.5 17.3 L 76.8 17.5 L 77 18 L 76.8 19 L 76.5 20 L 76.2 21 L 76 22 L 75.8 23 L 75.5 24 L 75 25 L 74.5 26 L 74 27 L 73.5 27.5 L 73 28 L 72.5 28.2 L 72 28 L 71.5 27.8 L 71 27.5 L 70.5 27.8 L 70 28 L 69.5 28.2 L 69 28.5 L 68.5 28.2 Z"
                fill="rgba(0, 91, 92, 0.12)"
                stroke="#005B5C"
                strokeWidth="0.4"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* State Highlights - Mark states with properties */}
          {Object.entries(southIndiaStates).map(([stateKey, stateInfo]) => {
            // Check if any property belongs to this state
            const hasProperties = stateHasProperties(stateKey);
            
            if (!hasProperties) return null;
            
            const statePosition = latLngToPixel(stateInfo.lat, stateInfo.lng);
            const bounds = stateInfo.bounds;
            
            // Calculate state bounds in pixels
            const topLeft = latLngToPixel(bounds.north, bounds.west);
            const bottomRight = latLngToPixel(bounds.south, bounds.east);
            const stateWidth = Math.abs(bottomRight.x - topLeft.x);
            const stateHeight = Math.abs(bottomRight.y - topLeft.y);
            
            return (
              <React.Fragment key={`state-${stateKey}`}>
                {/* State Area Highlight */}
                <div
                  className="state-area-highlight"
                  style={{
                    left: `${Math.min(topLeft.x, bottomRight.x)}px`,
                    top: `${Math.min(topLeft.y, bottomRight.y)}px`,
                    width: `${stateWidth}px`,
                    height: `${stateHeight}px`,
                  }}
                />
                {/* State Label */}
                <div
                  className="state-highlight"
                  style={{
                    left: `${statePosition.x}px`,
                    top: `${statePosition.y}px`,
                  }}
                >
                  <div className="state-marker">
                    <div className="state-pulse"></div>
                  </div>
                  <div className="state-label">{stateInfo.name}</div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Property Markers */}
          {southIndiaProperties.map((property) => {
            if (!property.location.latitude || !property.location.longitude) return null;

            const status = getPropertyStatus(property);
            const position = latLngToPixel(property.location.latitude, property.location.longitude);
            const isHovered = hoveredProperty?.id === property.id;
            const isSelected = selectedProperty?.id === property.id;

            return (
              <div
                key={property.id}
                className={`property-marker ${isHovered ? "hovered" : ""} ${isSelected ? "selected" : ""}`}
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  "--marker-color": getStatusColor(status),
                } as React.CSSProperties}
                onMouseEnter={() => setHoveredProperty(property)}
                onMouseLeave={() => setHoveredProperty(null)}
                onClick={() => {
                  setSelectedProperty(property);
                  onPropertyClick?.(property);
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="marker-pin">
                  <MapPin size={20} fill="currentColor" />
                </div>
                {isHovered && (
                  <div className="marker-tooltip">
                    <div className="tooltip-title">{property.title}</div>
                    <div className="tooltip-location">
                      {property.location.city}, {property.location.state}
                    </div>
                    <div className="tooltip-status">
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(status) }}>
                        {getStatusLabel(status)}
                      </span>
                    </div>
                    <div className="tooltip-price">
                      ₹{property.offerPrice ? property.offerPrice.toLocaleString() : property.actualPrice.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
};

export default PropertyMap;
