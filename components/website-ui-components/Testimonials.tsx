"use client";

import React, { useState, useEffect, useRef } from "react";
import { Testimonial } from "@/types/testimonial";
import apiClient from "@/lib/api";
import gsap from "gsap";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement | null>(null);
  const videoHasPlayedRef = useRef(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (!testimonials.length || !sectionRef.current || !containerRef.current) return;

    const section = sectionRef.current;
    const container = containerRef.current;
    const viewportWidth = window.innerWidth;
    // Use responsive initial width based on viewport
    const initialWidth = viewportWidth >= 1400 ? 1400 : viewportWidth;
    const maxScale = viewportWidth >= 1400 ? Math.max(1, viewportWidth / initialWidth) : 1;

    // Reset video play state when testimonial changes
    videoHasPlayedRef.current = false;
    if (mediaRef.current && mediaRef.current instanceof HTMLVideoElement) {
      mediaRef.current.pause();
      mediaRef.current.currentTime = 0;
    }

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate scroll progress based on section position in viewport
      // Start scaling when section enters viewport (top of section at bottom of viewport)
      // Finish scaling when section is centered in viewport
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      
      // When section top reaches viewport bottom, start = 0
      // When section is centered, progress = 1
      const triggerPoint = viewportHeight;
      const endPoint = viewportHeight - sectionHeight / 2;
      const scrollRange = triggerPoint - endPoint;
      
      const scrollProgress = Math.max(
        0,
        Math.min(1, (triggerPoint - sectionTop) / scrollRange)
      );

      // Scale from 1 to maxScale as user scrolls
      // Clamp scale to prevent overflow beyond viewport
      const scale = Math.min(1 + (maxScale - 1) * scrollProgress, maxScale);
      
      // Apply scale transformation smoothly
      gsap.to(container, {
        scale: scale,
        duration: 0.3,
        ease: "power1.out",
      });

      // Check if section fills the screen (scale >= maxScale * 0.9)
      const isFullscreen = scrollProgress >= 0.9;
      
      // Auto-play video when section fills the screen (only once per testimonial)
      const currentMedia = mediaRef.current;
      if (currentMedia && currentMedia instanceof HTMLVideoElement && isFullscreen && !videoHasPlayedRef.current) {
        currentMedia.play().then(() => {
          videoHasPlayedRef.current = true;
        }).catch((err) => {
          console.log("Video autoplay prevented:", err);
        });
      } else if (!isFullscreen && videoHasPlayedRef.current) {
        // Pause video when scrolling back up
        if (currentMedia && currentMedia instanceof HTMLVideoElement) {
          currentMedia.pause();
          videoHasPlayedRef.current = false;
        }
      }
    };

    // Handle window resize - recalculate scale for responsive behavior
    const handleResize = () => {
      handleScroll();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [testimonials, currentTestimonialIndex]);

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Use public endpoint (no authentication required)
      const response = await apiClient.get("/api/testimonials/public");
      if (response.data.success && response.data.data) {
        setTestimonials(response.data.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status !== 404) {
        setError("Failed to load testimonials");
        console.error("Error fetching testimonials:", err);
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

  if (isLoading) {
    return (
      <div className="testimonials">
        <div className="testimonials__loading">Loading...</div>
      </div>
    );
  }

  if (error || !testimonials || testimonials.length === 0) {
    return null; // Don't show anything if there's an error or no data
  }

  const currentTestimonial = testimonials[currentTestimonialIndex] || testimonials[0];
  const propertyMediaUrl = currentTestimonial?.propertyMedia
    ? getImageUrl(currentTestimonial.propertyMedia.url)
    : null;

  return (
    <div className="testimonials" ref={sectionRef}>
      <div className="testimonials__container" ref={containerRef}>
        {/* Background Media */}
        {propertyMediaUrl && (
          <div className="testimonials__background">
            {currentTestimonial.propertyMedia?.type === "video" ? (
              <video
                ref={(el) => {
                  mediaRef.current = el;
                }}
                src={propertyMediaUrl}
                className="testimonials__background-media"
                loop
                muted
                playsInline
                preload="auto"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={(el) => {
                  mediaRef.current = el;
                }}
                src={propertyMediaUrl}
                alt={currentTestimonial.title || "Testimonial"}
                className="testimonials__background-media"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>
        )}

        {/* Content Overlay - Bottom Left */}
        <div className="testimonials__content">
          <div className="testimonials__text">
            {currentTestimonial.title && (
              <h3 className="testimonials__title">
                {currentTestimonial.title}
              </h3>
            )}
            {currentTestimonial.description && (
              <p className="testimonials__description">
                {currentTestimonial.description}
              </p>
            )}
          </div>

          <div className="testimonials__client">
            <p className="testimonials__client-name">
              {currentTestimonial.clientName}
            </p>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {testimonials.length > 1 && (
        <div className="testimonials__pagination">
          {/* Previous Button */}
          <button
            className="testimonials__pagination-button testimonials__pagination-button--prev"
            onClick={() => {
              setCurrentTestimonialIndex((prev) =>
                prev === 0 ? testimonials.length - 1 : prev - 1
              );
            }}
            aria-label="Previous testimonial"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Dots Navigation */}
          <div className="testimonials__navigation">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`testimonials__dot ${
                  index === currentTestimonialIndex ? "testimonials__dot--active" : ""
                }`}
                onClick={() => setCurrentTestimonialIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            className="testimonials__pagination-button testimonials__pagination-button--next"
            onClick={() => {
              setCurrentTestimonialIndex((prev) =>
                prev === testimonials.length - 1 ? 0 : prev + 1
              );
            }}
            aria-label="Next testimonial"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 5L12.5 10L7.5 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Testimonials;
