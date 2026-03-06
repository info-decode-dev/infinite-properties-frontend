"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import {
  MapPin,
  Building,
  Phone,
  Mail,
  Globe,
  ChevronLeft,
  ChevronRight,
  X,
  Bed,
  Square,
  Ruler,
  Calendar,
  Sofa,
  Hospital,
  School,
  ShoppingBag,
  UtensilsCrossed,
  Car,
  Train,
  Plane,
  Coffee,
  Dumbbell,
  Landmark,
  Briefcase,
  Home,
  Waves,
  Shield,
  Wifi,
  Droplets,
  Zap,
  Wind,
  Flame,
  TreePine,
  DoorOpen,
  Gamepad2,
  BookOpen,
  Users,
  Camera,
  Lock,
  Tv,
  Fan,
  Sun,
  Snowflake,
  Sparkles,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import { Property } from "@/types/property";
import apiClient from "@/lib/api";
import dynamic from "next/dynamic";

// Dynamically import LocationMap to avoid SSR issues
const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="property-detail__map-loading">
      <p>Loading map...</p>
    </div>
  ),
});

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const PropertyDetailPage = () => {
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);

  // Request modal states
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    comment: "",
  });

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
      // Check if request was already sent for this property
      checkRequestStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const checkRequestStatus = () => {
    if (typeof window === "undefined") return;
    
    const sentRequests = JSON.parse(localStorage.getItem("property_requests") || "{}");
    if (sentRequests[propertyId]) {
      setIsRequestSent(true);
      // Restore form data if available
      const savedFormData = JSON.parse(localStorage.getItem("property_request_data") || "{}");
      if (savedFormData[propertyId]) {
        setRequestFormData(savedFormData[propertyId]);
      }
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchProperty = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get(`/api/properties/public/${propertyId}`);

      if (response.data.success && response.data.data) {
        const propertyData = response.data.data;
        setProperty({
          id: propertyData.id,
          title: propertyData.title,
          description: propertyData.description,
          images: propertyData.images || [],
          actualPrice: parseFloat(propertyData.actualPrice),
          offerPrice: propertyData.offerPrice
            ? parseFloat(propertyData.offerPrice)
            : undefined,
          location: propertyData.location || {
            exactLocation: "",
            city: "",
            state: "",
            country: "",
            latitude: propertyData.location?.latitude,
            longitude: propertyData.location?.longitude,
          },
          bhkType: propertyData.bhkType,
          propertyType: propertyData.propertyType,
          constructionStatus: propertyData.constructionStatus,
          landArea: propertyData.landArea,
          landAreaUnit: propertyData.landAreaUnit,
          builtUpArea: propertyData.builtUpArea,
          furnishedStatus: propertyData.furnishedStatus,
          negotiation: propertyData.negotiation,
          nearbyLandmarks: propertyData.nearbyLandmarks || [],
          accessibility: propertyData.accessibility || [],
          tags: propertyData.tags || [],
          amenities: propertyData.amenities || [],
          developerInfo: propertyData.developerInfo || {
            name: "",
            email: "",
            phone: "",
            website: "",
            description: "",
          },
          // Plot-specific fields
          landType: propertyData.landType,
          plotSize: propertyData.plotSize,
          plotSizeUnit: propertyData.plotSizeUnit,
          ownership: propertyData.ownership,
          createdAt: propertyData.createdAt,
          updatedAt: propertyData.updatedAt,
        });
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      if (error.response?.status !== 404) {
        setError(error.response?.data?.message || "Failed to load property details");
        console.error("Error fetching property:", err);
      } else {
        setError("Property not found");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
      return imagePath;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${apiUrl}${imagePath}`;
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      const crores = price / 10000000;
      return `₹${crores.toFixed(crores % 1 === 0 ? 0 : 1)}cr`;
    } else if (price >= 100000) {
      const lakhs = price / 100000;
      return `₹${lakhs.toFixed(lakhs % 1 === 0 ? 0 : 1)}L`;
    } else {
      const thousands = price / 1000;
      if (thousands >= 1) {
        return `₹${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}K`;
      }
      return `₹${price.toLocaleString("en-IN")}`;
    }
  };

  const getFacilityIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("hospital") || lowerName.includes("clinic") || lowerName.includes("medical")) {
      return Hospital;
    } else if (lowerName.includes("school") || lowerName.includes("college") || lowerName.includes("university") || lowerName.includes("education")) {
      return School;
    } else if (lowerName.includes("mall") || lowerName.includes("shopping") || lowerName.includes("market") || lowerName.includes("store")) {
      return ShoppingBag;
    } else if (lowerName.includes("restaurant") || lowerName.includes("cafe") || lowerName.includes("food") || lowerName.includes("dining")) {
      return UtensilsCrossed;
    } else if (lowerName.includes("coffee")) {
      return Coffee;
    } else if (lowerName.includes("gym") || lowerName.includes("fitness") || lowerName.includes("sport")) {
      return Dumbbell;
    } else if (lowerName.includes("bank") || lowerName.includes("atm") || lowerName.includes("financial")) {
      return Landmark;
    } else if (lowerName.includes("office") || lowerName.includes("business")) {
      return Briefcase;
    } else if (lowerName.includes("station") || lowerName.includes("metro") || lowerName.includes("train")) {
      return Train;
    } else if (lowerName.includes("airport") || lowerName.includes("air")) {
      return Plane;
    } else if (lowerName.includes("parking") || lowerName.includes("car")) {
      return Car;
    } else if (lowerName.includes("home") || lowerName.includes("residential")) {
      return Home;
    }
    return MapPin; // Default icon
  };

  const getAmenityIcon = (name: string) => {
    const lowerName = name.toLowerCase().trim();
    
    // Swimming Pool
    if (lowerName.includes("pool") || lowerName.includes("swimming")) {
      return Waves;
    }
    // Gym/Fitness
    if (lowerName.includes("gym") || lowerName.includes("fitness") || lowerName.includes("workout")) {
      return Dumbbell;
    }
    // Parking
    if (lowerName.includes("parking") || lowerName.includes("car park") || lowerName.includes("garage")) {
      return Car;
    }
    // Security
    if (lowerName.includes("security") || lowerName.includes("cctv") || lowerName.includes("surveillance") || lowerName.includes("guard")) {
      return Shield;
    }
    // WiFi/Internet
    if (lowerName.includes("wifi") || lowerName.includes("wi-fi") || lowerName.includes("internet") || lowerName.includes("broadband")) {
      return Wifi;
    }
    // Water Supply
    if (lowerName.includes("water") || lowerName.includes("24/7 water") || lowerName.includes("water supply")) {
      return Droplets;
    }
    // Power Backup
    if (lowerName.includes("power") || lowerName.includes("backup") || lowerName.includes("generator") || lowerName.includes("electricity")) {
      return Zap;
    }
    // Air Conditioning
    if (lowerName.includes("ac") || lowerName.includes("air condition") || lowerName.includes("cooling")) {
      return Wind;
    }
    // Heating
    if (lowerName.includes("heating") || lowerName.includes("heater") || lowerName.includes("central heat")) {
      return Flame;
    }
    // Garden/Park
    if (lowerName.includes("garden") || lowerName.includes("park") || lowerName.includes("green") || lowerName.includes("landscap")) {
      return TreePine;
    }
    // Balcony
    if (lowerName.includes("balcony") || lowerName.includes("terrace") || lowerName.includes("veranda")) {
      return DoorOpen;
    }
    // Elevator
    if (lowerName.includes("elevator") || lowerName.includes("lift")) {
      return Building;
    }
    // Playground
    if (lowerName.includes("playground") || lowerName.includes("play area") || lowerName.includes("kids")) {
      return Gamepad2;
    }
    // Library
    if (lowerName.includes("library") || lowerName.includes("reading")) {
      return BookOpen;
    }
    // Clubhouse
    if (lowerName.includes("club") || lowerName.includes("community") || lowerName.includes("common area")) {
      return Users;
    }
    // CCTV
    if (lowerName.includes("camera") || lowerName.includes("cctv")) {
      return Camera;
    }
    // Lock/Safe
    if (lowerName.includes("lock") || lowerName.includes("safe") || lowerName.includes("vault")) {
      return Lock;
    }
    // TV/Cable
    if (lowerName.includes("tv") || lowerName.includes("television") || lowerName.includes("cable")) {
      return Tv;
    }
    // Fan
    if (lowerName.includes("fan") || lowerName.includes("ceiling fan")) {
      return Fan;
    }
    // Sun/Outdoor
    if (lowerName.includes("sun") || lowerName.includes("outdoor") || lowerName.includes("rooftop")) {
      return Sun;
    }
    // Snowflake/Cold
    if (lowerName.includes("snow") || lowerName.includes("cold") || lowerName.includes("refrigerat")) {
      return Snowflake;
    }
    // Luxury/Premium
    if (lowerName.includes("luxury") || lowerName.includes("premium") || lowerName.includes("amenit")) {
      return Sparkles;
    }
    
    // Default icon
    return Home;
  };

  const nextImage = () => {
    if (property && property.images.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property && property.images.length > 0) {
      setSelectedImageIndex(
        (prev) => (prev - 1 + property.images.length) % property.images.length
      );
    }
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  const openRequestModal = () => {
    setIsRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setIsRequestModalOpen(false);
    if (!isRequestSent) {
      setRequestFormData({
        name: "",
        email: "",
        mobile: "",
        comment: "",
      });
    }
  };

  const handleRequestFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRequestFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!property) return;

    setIsSubmitting(true);
    try {
      await apiClient.post("/api/enquiries", {
        userName: requestFormData.name,
        userEmail: requestFormData.email,
        userPhone: requestFormData.mobile ? `+91${requestFormData.mobile.replace(/\s+/g, '')}` : undefined,
        message: requestFormData.comment || undefined,
        propertyId: property.id,
      });

      setIsRequestSent(true);
      setIsRequestModalOpen(false);
      setShowSuccessPopup(true);
      
      // Store in localStorage
      if (typeof window !== "undefined") {
        // Store request status
        const sentRequests = JSON.parse(localStorage.getItem("property_requests") || "{}");
        sentRequests[property.id] = {
          sent: true,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("property_requests", JSON.stringify(sentRequests));

        // Store form data for better UX (name, email for future requests)
        const savedFormData = JSON.parse(localStorage.getItem("property_request_data") || "{}");
        savedFormData[property.id] = {
          name: requestFormData.name,
          email: requestFormData.email,
          mobile: requestFormData.mobile,
        };
        localStorage.setItem("property_request_data", JSON.stringify(savedFormData));
      }
      
      // Hide success popup after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Failed to send request. Please try again.");
      console.error("Error submitting request:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendRequest = () => {
    setIsRequestSent(false);
    
    // Clear localStorage for this property to allow resending
    if (typeof window !== "undefined" && property) {
      const sentRequests = JSON.parse(localStorage.getItem("property_requests") || "{}");
      delete sentRequests[property.id];
      localStorage.setItem("property_requests", JSON.stringify(sentRequests));
    }
    
    // Keep name and email, clear comment
    setRequestFormData((prev) => ({
      name: prev.name,
      email: prev.email,
      mobile: "",
      comment: "",
    }));
    setIsRequestModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="property-detail">
        <div className="property-detail__container">
          <div className="property-detail__loading">Loading property details...</div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="property-detail">
        <div className="property-detail__container">
          <div className="property-detail__error">
            {error || "Property not found"}
          </div>
        </div>
      </div>
    );
  }

  const displayPrice = property.offerPrice || property.actualPrice;

  const locationText = property.location.exactLocation
    ? property.location.exactLocation
    : `${property.location.city}, ${property.location.state}, ${property.location.country}`;

  return (
    <div className="property-detail">
      <div className="property-detail__container">
        {/* Breadcrumbs */}
        <div className="property-detail__breadcrumbs">
          <a href="/" className="property-detail__breadcrumb-link">Home</a>
          <ChevronRight className="property-detail__breadcrumb-icon" />
          <a href="/properties" className="property-detail__breadcrumb-link">Properties</a>
          <ChevronRight className="property-detail__breadcrumb-icon" />
          <span className="property-detail__breadcrumb-current">{property.title}</span>
        </div>

        {/* Image Gallery */}
        {property.images && property.images.length > 0 && (
          <div className="property-detail__gallery">
            {/* Mobile: Carousel */}
            {isMobile ? (
              <div className="property-detail__carousel">
                <Swiper
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                  }}
                  modules={[Navigation, Pagination]}
                  navigation={true}
                  pagination={{ clickable: true }}
                  slidesPerView={1}
                  spaceBetween={12}
                  onSlideChange={(swiper) => setSelectedImageIndex(swiper.activeIndex)}
                  className="property-detail__swiper"
                >
                  {property.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <div
                        className="property-detail__carousel-item"
                        onClick={() => openImageModal(index)}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${property.title} - Image ${index + 1}`}
                          className="property-detail__carousel-item-img"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                
                {/* Thumbnail Preview */}
                {property.images.length > 1 && (
                  <div className="property-detail__carousel-thumbnails">
                    {property.images.map((image, index) => (
                      <div
                        key={index}
                        className={`property-detail__carousel-thumbnail ${
                          selectedImageIndex === index
                            ? "property-detail__carousel-thumbnail--active"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedImageIndex(index);
                          swiperRef.current?.slideTo(index);
                        }}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${property.title} - Thumbnail ${index + 1}`}
                          className="property-detail__carousel-thumbnail-img"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Desktop: Grid */
              <div className="property-detail__image-grid">
                {property.images.slice(0, 5).map((image, index) => {
                  // Premium Layout: 1 Main (Left) + 4 Small (Right)
                  // Grid: 3 columns (2fr 1fr 1fr), 2 rows
                  
                  let gridColumn = "1";
                  let gridRow = "1";
                  
                  if (index === 0) {
                    // Main image: Spans 2 rows, takes first column (2fr)
                    gridColumn = "1";
                    gridRow = "1 / 3";
                  } else if (index === 1) {
                    // Top middle
                    gridColumn = "2";
                    gridRow = "1";
                  } else if (index === 2) {
                    // Top right
                    gridColumn = "3";
                    gridRow = "1";
                  } else if (index === 3) {
                    // Bottom middle
                    gridColumn = "2";
                    gridRow = "2";
                  } else if (index === 4) {
                    // Bottom right
                    gridColumn = "3";
                    gridRow = "2";
                  }

                  return (
                    <div
                      key={index}
                      className={`property-detail__grid-item ${
                        selectedImageIndex === index
                          ? "property-detail__grid-item--active"
                          : ""
                      }`}
                      style={{
                        gridColumn: gridColumn,
                        gridRow: gridRow,
                      }}
                      onClick={() => {
                        setSelectedImageIndex(index);
                        openImageModal(index);
                      }}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${property.title} - Image ${index + 1}`}
                        className="property-detail__grid-item-img"
                      />
                      {index === 4 && property.images.length > 5 && (
                        <div className="property-detail__grid-item-overlay">
                          <span>+{property.images.length - 5} more</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="property-detail__content">
          {/* Left Column: Location, Price, Key Specs, Agent, Contact */}
          <div className="property-detail__left-column">
            {/* Location */}
            <div className="property-detail__location">
              <MapPin className="property-detail__location-icon" />
              <span className="property-detail__location-text">{locationText}</span>
            </div>

            {/* Price */}
            <div className="property-detail__price-section">
              <div className="property-detail__price">
                <span className="property-detail__price-current">
                  {formatPrice(displayPrice)}
                </span>
                <span className="property-detail__price-unit"></span>
              </div>
              <a href="#pricing" className="property-detail__pricing-link">
                Pricing details and terms
              </a>
            </div>

            {/* Key Specs */}
            <div className="property-detail__key-specs">
              {property.propertyType === "Plot" ? (
                <>
                  {/* Area for Lands */}
                  {(property.landArea || (property.plotSize && property.plotSizeUnit)) && (
                    <div className="property-detail__spec-item">
                      <div className="property-detail__spec-icon-wrapper">
                        <Square className="property-detail__spec-icon" />
                      </div>
                      <div className="property-detail__spec-content">
                        <span className="property-detail__spec-label">AREA</span>
                        <span className="property-detail__spec-value">
                          {property.landArea 
                            ? `${property.landArea} ${property.landAreaUnit || "cent"}`
                            : property.plotSize && property.plotSizeUnit
                            ? `${property.plotSize} ${property.plotSizeUnit}`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Land Type - Always show for Plot properties */}
                  <div className="property-detail__spec-item">
                    <div className="property-detail__spec-icon-wrapper">
                      <Building className="property-detail__spec-icon" />
                    </div>
                    <div className="property-detail__spec-content">
                      <span className="property-detail__spec-label">Land Type</span>
                      <span className="property-detail__spec-value">
                        {property.landType || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Ownership - Always show for Plot properties */}
                  <div className="property-detail__spec-item">
                    <div className="property-detail__spec-icon-wrapper">
                      <Shield className="property-detail__spec-icon" />
                    </div>
                    <div className="property-detail__spec-content">
                      <span className="property-detail__spec-label">Ownership</span>
                      <span className="property-detail__spec-value">
                        {property.ownership || "N/A"}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {property.bhkType && (
                    <div className="property-detail__spec-item">
                      <div className="property-detail__spec-icon-wrapper">
                        <Bed className="property-detail__spec-icon" />
                      </div>
                      <div className="property-detail__spec-content">
                        <span className="property-detail__spec-label">Bedrooms</span>
                        <span className="property-detail__spec-value">{property.bhkType}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="property-detail__spec-item">
                    <div className="property-detail__spec-icon-wrapper">
                      <Building className="property-detail__spec-icon" />
                    </div>
                    <div className="property-detail__spec-content">
                      <span className="property-detail__spec-label">Type</span>
                      <span className="property-detail__spec-value">{property.propertyType}</span>
                    </div>
                  </div>

                  {property.landArea && (
                    <div className="property-detail__spec-item">
                      <div className="property-detail__spec-icon-wrapper">
                        <Square className="property-detail__spec-icon" />
                      </div>
                      <div className="property-detail__spec-content">
                        <span className="property-detail__spec-label">Area</span>
                        <span className="property-detail__spec-value">
                          {property.landArea} {property.landAreaUnit || "cent"}
                        </span>
                      </div>
                    </div>
                  )}

                  {property.builtUpArea && (
                    <div className="property-detail__spec-item">
                      <div className="property-detail__spec-icon-wrapper">
                        <Ruler className="property-detail__spec-icon" />
                      </div>
                      <div className="property-detail__spec-content">
                        <span className="property-detail__spec-label">Built-up</span>
                        <span className="property-detail__spec-value">
                          {property.builtUpArea} sq.ft
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="property-detail__spec-item">
                    <div className="property-detail__spec-icon-wrapper">
                      <Calendar className="property-detail__spec-icon" />
                    </div>
                    <div className="property-detail__spec-content">
                      <span className="property-detail__spec-label">Status</span>
                      <span className="property-detail__spec-value">{property.constructionStatus}</span>
                    </div>
                  </div>

                  {property.furnishedStatus && (
                    <div className="property-detail__spec-item">
                      <div className="property-detail__spec-icon-wrapper">
                        <Sofa className="property-detail__spec-icon" />
                      </div>
                      <div className="property-detail__spec-content">
                        <span className="property-detail__spec-label">Furnishing</span>
                        <span className="property-detail__spec-value">{property.furnishedStatus}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Agent Info */}
            {property.developerInfo && (
              <div className="property-detail__agent">
                <div className="property-detail__agent-avatar">
                  <Building className="property-detail__agent-avatar-icon" />
                </div>
                <div className="property-detail__agent-info">
                  <span className="property-detail__agent-label">Agent:</span>
                  <span className="property-detail__agent-name">
                    {property.developerInfo.name}
                  </span>
                </div>
              </div>
            )}

            {/* Contact Button */}
            <div className="property-detail__contact-button-wrapper">
              <button
                className={`property-detail__contact-button ${
                  isRequestSent ? "property-detail__contact-button--sent" : ""
                }`}
                onClick={openRequestModal}
                disabled={isRequestSent}
              >
                {isRequestSent ? "Request sent" : "Send a request"}
              </button>
              {isRequestSent && (
                <button
                  className="property-detail__resend-button"
                  onClick={handleResendRequest}
                  aria-label="Resend request"
                >
                  <RotateCcw className="property-detail__resend-icon" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Save/Share, About, Description, Amenities */}
          <div className="property-detail__right-column">
            {/* Action Buttons */}
            {/* <div className="property-detail__action-buttons">
              <button className="property-detail__action-button">
                <Heart className="property-detail__action-icon" />
                <span>Save</span>
              </button>
              <button className="property-detail__action-button">
                <Share2 className="property-detail__action-icon" />
                <span>Share</span>
              </button>
            </div> */}

            {/* About Section */}
            <div className="property-detail__about-section">
              <h2 className="property-detail__about-title">About property</h2>
              <p className="property-detail__description">
                {property.description || "Discover your ideal urban retreat in this stunning property, perfectly situated in a vibrant location."}
              </p>
              {/* <a href="#description" className="property-detail__full-description-link">
                Full description
              </a> */}
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="property-detail__amenities-section">
                {property.amenities.map((amenity) => {
                  const AmenityIcon = getAmenityIcon(amenity.name);
                  return (
                    <div key={amenity.id} className="property-detail__amenity-item">
                      <div className="property-detail__amenity-icon-wrapper">
                        <AmenityIcon className="property-detail__amenity-icon" />
                      </div>
                      <span className="property-detail__amenity-name">{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Accessibility */}
            {property.accessibility && property.accessibility.length > 0 && (
              <div className="property-detail__section">
                <h2 className="property-detail__section-title">Nearby Facilities</h2>
                <div className="property-detail__accessibility-list">
                  {property.accessibility.map((item) => {
                    const FacilityIcon = getFacilityIcon(item.name);
                    return (
                      <div key={item.id} className="property-detail__accessibility-item">
                        <div className="property-detail__accessibility-icon-wrapper">
                          <FacilityIcon className="property-detail__accessibility-icon" />
                        </div>
                        <div className="property-detail__accessibility-content">
                          <span className="property-detail__accessibility-name">
                            {item.name}
                          </span>
                          <span className="property-detail__accessibility-distance">
                            {item.distance} {item.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nearby Landmarks */}
            {property.nearbyLandmarks && property.nearbyLandmarks.length > 0 && (
              <div className="property-detail__section">
                <h2 className="property-detail__section-title">Nearby Landmarks</h2>
                <div className="property-detail__landmarks-list">
                  {property.nearbyLandmarks.map((landmark, index) => (
                    <div key={index} className="property-detail__landmark">
                      <Landmark className="property-detail__landmark-icon" />
                      <span className="property-detail__landmark-name">{landmark}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map */}
            {property.location.latitude && property.location.longitude ? (
              <div className="property-detail__section">
                <h2 className="property-detail__section-title">Location</h2>
                <div className="property-detail__map">
                  <LocationMap
                    latitude={property.location.latitude}
                    longitude={property.location.longitude}
                    address={property.location.exactLocation}
                    city={property.location.city}
                    state={property.location.state}
                    editable={false}
                  />
                </div>
              </div>
            ) : (
              <div className="property-detail__section">
                <h2 className="property-detail__section-title">Location</h2>
                <div className="property-detail__map-placeholder">
                  <p className="property-detail__map-placeholder-text">
                    Location coordinates are being processed. Please check back shortly.
                  </p>
                </div>
              </div>
            )}

            {/* Developer Info */}
            {property.developerInfo && (
              <div className="property-detail__section">
                <h2 className="property-detail__section-title">Developer Information</h2>
                <div className="property-detail__developer-card">
                  {/* Background Image */}
                  <div 
                    className="property-detail__developer-bg"
                    style={{
                      backgroundImage: property.images && property.images.length > 0
                        ? `url(${getImageUrl(property.images[0])})`
                        : `linear-gradient(135deg, ${process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#3b82f6'} 0%, ${process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#8b5cf6'} 100%)`
                    }}
                  >
                    {/* Gradient Overlay with Blur Mask */}
                    <div className="property-detail__developer-overlay"></div>
                    <div className="property-detail__developer-blur-mask"></div>
                  </div>

                  {/* Content */}
                  <div className="property-detail__developer-content">
                    {/* Text Content */}
                    <div className="property-detail__developer-text">
                      {/* Logo and Title */}
                      <div className="property-detail__developer-header">
                        <div className="property-detail__developer-logo-wrapper">
                          <Building className="property-detail__developer-logo-icon" />
                        </div>
                        <h3 className="property-detail__developer-title">
                          {property.developerInfo.name}
                        </h3>
                      </div>
                      {property.developerInfo.description && (
                        <p className="property-detail__developer-subtitle">
                          {property.developerInfo.description}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="property-detail__developer-actions">
                      {property.developerInfo.phone && (
                        <a
                          href={`tel:${property.developerInfo.phone}`}
                          className="property-detail__developer-action-btn"
                          aria-label="Call Developer"
                        >
                          <Phone className="property-detail__developer-action-icon" />
                          <span>Call</span>
                        </a>
                      )}
                      {property.developerInfo.email && (
                        <a
                          href={`mailto:${property.developerInfo.email}`}
                          className="property-detail__developer-action-btn"
                          aria-label="Email Developer"
                        >
                          <Mail className="property-detail__developer-action-icon" />
                          <span>Email</span>
                        </a>
                      )}
                      {property.developerInfo.website && (
                        <a
                          href={property.developerInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="property-detail__developer-action-btn property-detail__developer-action-btn--primary"
                          aria-label="Visit Website"
                        >
                          <Globe className="property-detail__developer-action-icon" />
                          <span>Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && property.images.length > 0 && (
        <div className="property-detail__modal" onClick={closeImageModal}>
          <button
            className="property-detail__modal-close"
            onClick={closeImageModal}
            aria-label="Close modal"
          >
            <X />
          </button>
          <div
            className="property-detail__modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageUrl(property.images[selectedImageIndex])}
              alt={property.title}
              className="property-detail__modal-image"
            />
            {property.images.length > 1 && (
              <>
                <button
                  className="property-detail__modal-nav property-detail__modal-nav--prev"
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft />
                </button>
                <button
                  className="property-detail__modal-nav property-detail__modal-nav--next"
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Request Modal */}
      {isRequestModalOpen && (
        <div
          className="property-detail__request-modal"
          onClick={closeRequestModal}
        >
          <div
            className="property-detail__request-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="property-detail__request-modal-close"
              onClick={closeRequestModal}
              aria-label="Close modal"
            >
              <X />
            </button>

            {/* Logo and Brand Section */}
            <div className="property-detail__request-modal-header">
              <div className="property-detail__request-modal-logo">
                <Image
                  src="/assets/images/logo.png"
                  alt="Infinite Properties Logo"
                  width={80}
                  height={40}
                  className="property-detail__request-modal-logo-image"
                />
              </div>
              <h2 className="property-detail__request-modal-title">
                Get in Touch
              </h2>
              <p className="property-detail__request-modal-subtitle">
                We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
              </p>
            </div>

            <form
              className="property-detail__request-form"
              onSubmit={handleRequestSubmit}
            >
              <div className="property-detail__request-form-group">
                <label
                  htmlFor="request-name"
                  className="property-detail__request-form-label"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="request-name"
                  name="name"
                  value={requestFormData.name}
                  onChange={handleRequestFormChange}
                  className="property-detail__request-form-input"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="property-detail__request-form-group">
                <label
                  htmlFor="request-email"
                  className="property-detail__request-form-label"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="request-email"
                  name="email"
                  value={requestFormData.email}
                  onChange={handleRequestFormChange}
                  className="property-detail__request-form-input"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="property-detail__request-form-group">
                <label
                  htmlFor="request-mobile"
                  className="property-detail__request-form-label"
                >
                  Phone Number
                </label>
                <div className="property-detail__request-phone-wrapper">
                  <span className="property-detail__request-phone-prefix">+91</span>
                  <input
                    type="tel"
                    id="request-mobile"
                    name="mobile"
                    value={requestFormData.mobile}
                    onChange={handleRequestFormChange}
                    className="property-detail__request-form-input property-detail__request-form-input--phone"
                    placeholder="98765 43210"
                  />
                </div>
              </div>

              <div className="property-detail__request-form-group">
                <label
                  htmlFor="request-comment"
                  className="property-detail__request-form-label"
                >
                  Message
                </label>
                <textarea
                  id="request-comment"
                  name="comment"
                  value={requestFormData.comment}
                  onChange={handleRequestFormChange}
                  className="property-detail__request-form-textarea"
                  placeholder="Tell us about your requirements..."
                  rows={4}
                />
              </div>

              <button
                type="submit"
                className="property-detail__request-form-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="property-detail__request-form-submit-spinner"></span>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="property-detail__success-popup">
          <div className="property-detail__success-popup-content">
            <CheckCircle className="property-detail__success-popup-icon" />
            <p className="property-detail__success-popup-message">
              Request sent successfully!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;
