"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import HeaderText from "../website-ui-components/HeaderText";
import PropertyCardSkeleton from "../website-ui-components/PropertyCardSkeleton";
import { Property } from "@/types/property";
import apiClient from "@/lib/api";
import PropertyCardUiModern from "../website-ui-components/PropertyCardUiModern";
import gsap from "gsap";
import { usePropertyType } from "@/contexts/PropertyTypeContext";

const QuickCollections = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  const router = useRouter();
  const { propertyType } = usePropertyType();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.get("/api/properties/public");
      if (response.data.success) {
        console.log(response.data.data);
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
          location: p.location || {
            exactLocation: "",
            city: "",
            state: "",
            country: "",
          },
          bhkType: p.bhkType,
          propertyType: p.propertyType || "Home",
          constructionStatus: p.constructionStatus,
          tags: p.tags || [],
          amenities: p.amenities || [],
          developerInfo: p.developerInfo || {
            name: "",
          },
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));

        // Filter based on propertyType from context
        let filteredProperties = transformedProperties;
        if (propertyType === "lands") {
          // Show only Plot properties when lands is selected
          filteredProperties = transformedProperties.filter(p => p.propertyType === "Plot");
        } else {
          // Show all properties except Plot when properties is selected
          filteredProperties = transformedProperties.filter(p => p.propertyType !== "Plot");
        }

        setProperties(filteredProperties.slice(0, 9));
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to fetch properties");
      console.error("Error fetching properties:", err);
    } finally {
      setIsLoading(false);
    }
  }, [propertyType]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Animation effect
  useEffect(() => {
    if (isLoading || !sectionRef.current || !gridRef.current) return;

    const ctx = gsap.context(() => {
      // Set initial states
      if (headerRef.current) {
        gsap.set(headerRef.current, {
          opacity: 0,
          y: 50,
        });
      }

      const cards = gridRef.current?.querySelectorAll(".property-card-modern");
      if (cards && cards.length > 0) {
        gsap.set(cards, {
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

              // Animate cards with stagger
              if (cards && cards.length > 0) {
                gsap.to(cards, {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.6,
                  stagger: 0.1,
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
  }, [isLoading, properties]);



  return (
    <div ref={sectionRef} className="quick-collections">
      {/* collection header */}
      <div ref={headerRef}>
        <HeaderText 
          title={title} 
          subtitle={subtitle} 
          alignment="left" 
          actionButtonText="View All" 
          onActionClick={() => {
            if (propertyType === "lands") {
              router.push("/properties?propertyType=Plot");
            } else {
              router.push("/properties");
            }
          }} 
        />
      </div>
      
      {/* <div className="quick-collections__filter">
      <QuickFilter onFilterChange={handleFilterChange} />
      </div> */}

      {/* Properties Grid */}
      {isLoading ? (
        <div className="quick-collections__grid">
          {[...Array(9)].map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="quick-collections__error">
          <p>{error}</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="quick-collections__empty">
          <p>No properties found.</p>
        </div>
      ) : (
        <div ref={gridRef} className="quick-collections__grid">
          {properties.map((property) => (
            // <PropertyCardUi key={property.id} property={property} />
            <PropertyCardUiModern key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickCollections;
