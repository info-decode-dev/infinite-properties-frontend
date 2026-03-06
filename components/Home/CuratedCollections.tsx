"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building, FolderOpen, Package } from "lucide-react";
import HeaderText from "../website-ui-components/HeaderText";
import { CuratedCollection } from "@/types/collection";
import apiClient from "@/lib/api";
import gsap from "gsap";

const CuratedCollections = () => {
  const router = useRouter();
  const [collections, setCollections] = useState<CuratedCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.get("/api/collections/collections/public");
      
      if (response.data.success) {
        setCollections(response.data.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      // Only show error if it's not a 404 (404 might mean no collections exist yet)
      if (error.response?.status !== 404) {
        setError(error.response?.data?.message || error.message || "Failed to fetch collections");
        console.error("Error fetching collections:", err);
      } else {
        // 404 is okay - just means no collections exist yet
        setCollections([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

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

      const cards = gridRef.current?.querySelectorAll(".curated-collection-card");
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
  }, [isLoading, collections]);

  const handleCollectionClick = (collectionId: string) => {
    router.push(`/properties?collectionId=${collectionId}`);
  };

  return (
    <div ref={sectionRef} className="curated-collections">
      <div ref={headerRef}>
        <HeaderText title="Curated Collections" subtitle="properties types" />
      </div>

      {isLoading ? (
        <div className="curated-collections__loading">
          <p>Loading collections...</p>
        </div>
      ) : error ? (
        <div className="curated-collections__error">
          <p>{error}</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="curated-collections__empty">
          <div className="curated-collections__empty-icon">
            <Package size={64} />
          </div>
          <h3 className="curated-collections__empty-title">No Collections Available</h3>
          <p className="curated-collections__empty-message">
            We're curating amazing property collections for you. Check back soon!
          </p>
        </div>
      ) : (
        <div ref={gridRef} className="curated-collections__grid">
          {collections.map((collection) => (
            <div 
              key={collection.id} 
              className="curated-collection-card"
              onClick={() => handleCollectionClick(collection.id)}
            >
              {collection.image && (
                <div className="curated-collection-card__image">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${collection.image}`}
                    alt={collection.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-collection.jpg";
                    }}
                  />
                </div>
              )}
              <div className="curated-collection-card__icon-wrapper">
                <Building className="curated-collection-card__icon" />
                {collection.propertyCount !== undefined && collection.propertyCount > 0 && (
                  <span className="curated-collection-card__count">
                    {collection.propertyCount}
                  </span>
                )}
              </div>
              <div className="curated-collection-card__content">
                <h3 className="curated-collection-card__title">{collection.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CuratedCollections;
