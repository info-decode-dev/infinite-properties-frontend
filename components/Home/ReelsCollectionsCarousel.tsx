"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ArrowRight, Film } from "lucide-react";
import HeaderText from "../website-ui-components/HeaderText";
import { Reel } from "@/types/collection";
import apiClient from "@/lib/api";
import { Property } from "@/types/property";
import PropertyMap from "../PropertyMap";
import gsap from "gsap";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";

const ReelsCollectionsCarousel = () => {
  const router = useRouter();
  const [reels, setReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isManuallyScrolled, setIsManuallyScrolled] = useState(false);
  // Store array of images for each reel
  const [propertyImages, setPropertyImages] = useState<Record<string, string[]>>({});
  // Track which reels have valid properties (property exists and is available)
  const [validReelIds, setValidReelIds] = useState<Set<string>>(new Set());
  const [properties, setProperties] = useState<Property[]>([]);
  const swiperRef = useRef<SwiperType | null>(null);
  const manualScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteractingRef = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Memoize checkMobile to prevent unnecessary re-renders
  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile((prev) => {
      if (prev !== mobile) {
        return mobile;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    fetchReels();
    fetchProperties();
    checkMobile();

    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch properties for the map
  const fetchProperties = useCallback(async () => {
    try {
      const response = await apiClient.get("/api/properties/public?limit=1000");
      if (response.data.success) {
        // Transform API response to match Property type
        const transformedProperties: Property[] = response.data.data.map((p: {
          id: string;
          title: string;
          description: string;
          images?: string[];
          actualPrice: string | number;
          offerPrice?: string | number;
          location?: {
            exactLocation?: string;
            city?: string;
            state?: string;
            country?: string;
            latitude?: number;
            longitude?: number;
          };
          bhkType: string;
          propertyType?: string;
          constructionStatus: string;
          tags?: string[];
          amenities?: unknown[];
          developerInfo?: { name: string };
          createdAt?: Date;
          updatedAt?: Date;
        }) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          images: p.images || [],
          actualPrice: typeof p.actualPrice === 'string' ? parseFloat(p.actualPrice) : p.actualPrice,
          offerPrice: p.offerPrice ? (typeof p.offerPrice === 'string' ? parseFloat(p.offerPrice) : p.offerPrice) : undefined,
          location: {
            exactLocation: p.location?.exactLocation || "",
            city: p.location?.city || "",
            state: p.location?.state || "",
            country: p.location?.country || "India",
            latitude: p.location?.latitude,
            longitude: p.location?.longitude,
          },
          bhkType: p.bhkType as Property["bhkType"],
          propertyType: (p.propertyType || "Home") as Property["propertyType"],
          constructionStatus: p.constructionStatus as Property["constructionStatus"],
          tags: (p.tags || []) as Property["tags"],
          amenities: (p.amenities || []) as Property["amenities"],
          developerInfo: p.developerInfo || {
            name: "",
          },
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));
        setProperties(transformedProperties);
      }
    } catch (err: unknown) {
      console.error("Error fetching properties for map:", err);
      // Don't show error to user, just log it
    }
  }, []);

  const fetchReels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.get("/api/collections/reels/public");

      if (response.data.success) {
        const fetchedReels = response.data.data;
        setReels(fetchedReels);
        
        // Immediately mark reels without actionButtonLink as valid (they don't need property validation)
        const initialValidReels = new Set<string>();
        fetchedReels.forEach((reel: Reel) => {
          if (!reel.actionButtonLink) {
            initialValidReels.add(reel.id);
          }
        });
        setValidReelIds(initialValidReels);
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      // Only show error if it's not a 404 (404 might mean no reels exist yet)
      if (error.response?.status !== 404) {
        setError(error.response?.data?.message || error.message || "Failed to fetch reels");
        console.error("Error fetching reels:", err);
      } else {
        // 404 is okay - just means no reels exist yet
        setReels([]);
        setValidReelIds(new Set());
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Extract property ID from actionButtonLink
  const extractPropertyId = useCallback((actionButtonLink?: string): string | null => {
    if (!actionButtonLink) return null;
    
    // Handle format: /properties/{id}
    const match = actionButtonLink.match(/\/properties\/([^\/\?#]+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    // If it's already just an ID (no slashes), return as is
    if (!actionButtonLink.includes('/')) {
      return actionButtonLink;
    }
    
    return null;
  }, []);

  // Fetch property images for reels with actionButtonLink and validate properties
  const fetchPropertyImages = useCallback(async () => {
    const propertiesToFetch: Array<{ reelId: string; propertyId: string }> = [];
    const validReels = new Set<string>();

    // First, mark all reels without actionButtonLink as valid (they don't need property validation)
    reels.forEach((reel) => {
      if (!reel.actionButtonLink) {
        validReels.add(reel.id);
      } else {
        const propertyId = extractPropertyId(reel.actionButtonLink);
        if (propertyId) {
          propertiesToFetch.push({ reelId: reel.id, propertyId });
        } else {
          // If actionButtonLink exists but can't extract property ID, mark as invalid
          // (we can't validate it, so we'll exclude it)
          console.warn(`Reel ${reel.id} has actionButtonLink but couldn't extract property ID: ${reel.actionButtonLink}`);
        }
      }
    });

    if (propertiesToFetch.length === 0) {
      // No properties to validate, all reels without actionButtonLink are valid
      setValidReelIds(validReels);
      return;
    }

    // Fetch all properties in parallel
    const fetchPromises = propertiesToFetch.map(async ({ reelId, propertyId }) => {
      try {
        const response = await apiClient.get(`/api/properties/public/${propertyId}`);
        if (response.data.success && response.data.data) {
          const property: Property = response.data.data;
          
          // Property exists and is valid
          validReels.add(reelId);
          
          if (property.images && property.images.length > 0) {
            // Get up to 3 images
            const images = property.images.slice(0, 3).map(imagePath => {
               // Handle relative paths by prepending API URL
               if (!imagePath.startsWith("http://") && !imagePath.startsWith("https://")) {
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                  return `${apiUrl}${imagePath}`;
                }
                return imagePath;
            });
            return { reelId, images, isValid: true };
          }
          return { reelId, images: [], isValid: true };
        }
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } };
        // Property doesn't exist (404) or has an error - mark reel as invalid
        if (error.response?.status === 404) {
          console.warn(`Property ${propertyId} for reel ${reelId} not found - excluding reel from display`);
        } else {
          console.error(`Error fetching property ${propertyId} for reel ${reelId}:`, err);
        }
        // Don't add to validReels - this reel will be filtered out
      }
      return { reelId, images: [], isValid: false };
    });

    const results = await Promise.all(fetchPromises);
    const newPropertyImages: Record<string, string[]> = {};
    
    results.forEach((result) => {
      if (result && result.isValid) {
        if (result.images && result.images.length > 0) {
          newPropertyImages[result.reelId] = result.images;
        }
      }
    });

    // Update valid reel IDs
    setValidReelIds(validReels);

    // Update property images
    if (Object.keys(newPropertyImages).length > 0) {
      setPropertyImages((prev) => ({ ...prev, ...newPropertyImages }));
    }
  }, [reels, extractPropertyId]);

  // Fetch property images when reels are loaded
  useEffect(() => {
    if (reels.length > 0) {
      fetchPropertyImages();
    }
  }, [reels, fetchPropertyImages]);

  const handleManualScroll = useCallback(() => {
    if (isMobile && !isManuallyScrolled && isUserInteractingRef.current) {
      // User manually scrolled
      setIsManuallyScrolled(true);

      // Clear existing timeout
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }

      // Disable autoplay for 2 minutes
      if (swiperRef.current) {
        swiperRef.current.autoplay?.stop();
      }

      // Re-enable after 2 minutes
      manualScrollTimeoutRef.current = setTimeout(() => {
        setIsManuallyScrolled(false);
        isUserInteractingRef.current = false;
        if (swiperRef.current) {
          swiperRef.current.autoplay?.start();
        }
      }, 120000); // 2 minutes
    }
  }, [isMobile, isManuallyScrolled]);

  const handleTouchStart = useCallback(() => {
    if (isMobile) {
      isUserInteractingRef.current = true;
      handleManualScroll();
    }
  }, [isMobile, handleManualScroll]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
    };
  }, []);

  // Animation effect for Reels section
  useEffect(() => {
    if (isLoading || !sectionRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // Set initial states
      if (headerRef.current) {
        gsap.set(headerRef.current, {
          opacity: 0,
          y: 50,
        });
      }

      const swiper = contentRef.current?.querySelector(".reels-collections-carousel__swiper");
      if (swiper) {
        gsap.set(swiper, {
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

              // Animate swiper
              if (swiper) {
                gsap.to(swiper, {
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
  }, [isLoading, reels]);

  // Get main thumbnail - prioritize property image, then YouTube thumbnail, then fallback
  const getMainThumbnail = useCallback((reel: Reel) => {
    // First, try to get property thumbnail if available
    if (propertyImages[reel.id] && propertyImages[reel.id].length > 0) {
      return propertyImages[reel.id][0];
    }

    // If it's a YouTube link, extract thumbnail
    if (reel.link.includes("youtube.com") || reel.link.includes("youtu.be")) {
      const videoId = reel.link.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
      )?.[1];
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    
    // If it's already an image or other link, return as is
    return reel.link;
  }, [propertyImages]);

  // Memoize autoplay config to prevent re-renders
  const autoplayConfig = useMemo(() => {
    return isMobile
      ? {
          delay: 2000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }
      : {
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        };
  }, [isMobile]);

  // Memoize breakpointsConfig
  const breakpointsConfig = useMemo(
    () => ({
      0: {
        slidesPerView: 1 as const,
        spaceBetween: 12,
      },
      375: {
        slidesPerView: 1 as const,
        spaceBetween: 14,
      },
      480: {
        slidesPerView: 1 as const,
        spaceBetween: 16,
      },
      640: {
        slidesPerView: 1 as const,
        spaceBetween: 18,
      },
      768: {
        slidesPerView: "auto" as const,
        spaceBetween: 16,
      },
      1024: {
        slidesPerView: "auto" as const,
        spaceBetween: 16,
      },
      1280: {
        slidesPerView: "auto" as const,
        spaceBetween: 16,
      },
      1440: {
        slidesPerView: "auto" as const,
        spaceBetween: 16,
      },
      1920: {
        slidesPerView: "auto" as const,
        spaceBetween: 16,
      },
    }),
    []
  );

  return (
    <div ref={sectionRef} className="reels-collections-carousel">
      <div ref={headerRef}>
        <HeaderText title="Reels Collections" subtitle="watch our reels" />
      </div>

      {isLoading ? (
        <div className="reels-collections-carousel__loading">
          <p>Loading reels...</p>
        </div>
      ) : error ? (
        <div className="reels-collections-carousel__error">
          <p>{error}</p>
        </div>
      ) : reels.length === 0 ? (
        <div className="reels-collections-carousel__empty">
          <div className="reels-collections-carousel__empty-icon">
            <Film size={64} />
          </div>
          <h3 className="reels-collections-carousel__empty-title">No Reels Available</h3>
          <p className="reels-collections-carousel__empty-message">
            We&apos;re working on creating amazing property reels for you. Check back soon!
          </p>
        </div>
      ) : (
        <div ref={contentRef} className="reels-collections-carousel__content">
          <Swiper
            onSwiper={(swiper: SwiperType) => {
              swiperRef.current = swiper;
            }}
            modules={[Autoplay, FreeMode]}
            spaceBetween={12}
            slidesPerView={isMobile ? 1 : "auto"}
            freeMode={isMobile}
            autoplay={autoplayConfig}
            speed={isMobile ? 500 : 1000}
            loop={true}
            onTouchStart={handleTouchStart}
            breakpoints={breakpointsConfig}
            className="reels-collections-carousel__swiper"
          >
            {reels
              .filter((reel) => {
                // Only show reels that are valid (property exists if actionButtonLink is set)
                return validReelIds.has(reel.id);
              })
              .map((reel) => (
              <SwiperSlide
                key={reel.id}
                className="reels-collections-carousel__slide"
              >
                <div className="reels-collections-carousel__item">
                  <div className="reels-collections-carousel__media-wrapper">
                    <img
                      src={getMainThumbnail(reel)}
                      alt={reel.title}
                      className="reels-collections-carousel__main-image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Fallback logic
                         if (reel.link.includes("youtube.com") || reel.link.includes("youtu.be")) {
                          const videoId = reel.link.match(
                            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
                          )?.[1];
                          if (videoId) {
                            target.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                            return;
                          }
                        }
                        target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='550'%3E%3Crect fill='%23e5e7eb' width='400' height='550'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='18' fill='%239ca3af'%3EImage not available%3C/text%3E%3C/svg%3E";
                        target.onerror = null;
                      }}
                    />
                     {/* Play Button Overlay */}
                     <div className="reels-collections-carousel__play-overlay">
                        <button 
                          className="reels-collections-carousel__play-button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(reel.link, '_blank', 'noopener,noreferrer');
                          }}
                          aria-label="Play Reel"
                        >
                           <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                             <path d="M8 5v14l11-7z" />
                           </svg>
                        </button>
                     </div>

                     <a
                      href={reel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="reels-collections-carousel__link-overlay"
                      aria-label={`View reel: ${reel.title}`}
                    />
                  </div>

                  <div className="reels-collections-carousel__overlay">
                      {/* Top Section: Profile */}
                      <div className="reels-collections-carousel__header">
                         <div className="reels-collections-carousel__profile">
                          <div className="reels-collections-carousel__profile-image">
                            <img
                              src="/assets/images/infinite-logo.png"
                              alt="Infinite Logo"
                            />
                          </div>
                          <span className="reels-collections-carousel__profile-name">
                            Infinite Properties
                          </span>
                        </div>
                      </div>

                       {/* Sidebar Actions Removed as per request */}
                      
                      {/* Bottom Section: CTA & Details */}
                      <div className="reels-collections-carousel__footer">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                             const propertyId = extractPropertyId(reel.actionButtonLink);
                            if (propertyId) {
                              router.push(`/properties/${propertyId}`);
                            } else if (reel.actionButtonLink) {
                              window.open(reel.actionButtonLink, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          className="reels-collections-carousel__cta-button"
                        >
                          View Property
                          <ArrowRight size={16} />
                        </button>

                         <div className="reels-collections-carousel__info">
                           <h3 className="reels-collections-carousel__title">
                            {reel.title}
                           </h3>
                           {reel.description && (
                             <p className="reels-collections-carousel__description">
                               {reel.description}
                             </p>
                           )}
                         </div>
                         
                         {/* Thumbnails Strip */}
                         {propertyImages[reel.id] && propertyImages[reel.id].length > 0 && (
                           <div className="reels-collections-carousel__thumbnails">
                             {propertyImages[reel.id].map((imgSrc, idx) => (
                               <div key={idx} className="reels-collections-carousel__thumbnail-item">
                                 <img src={imgSrc} alt={`View ${idx + 1}`} />
                               </div>
                             ))}
                           </div>
                         )}
                      </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Property Map Section */}
      <div className="reels-collections-carousel__map-section">
        <PropertyMap
          properties={properties}
          height="600px"
          onPropertyClick={(property) => {
            router.push(`/properties/${property.id}`);
          }}
        />
      </div>
    </div>
  );
};

export default ReelsCollectionsCarousel;
