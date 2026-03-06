"use client";

import React, { useState, useEffect, useRef } from "react";
import { Settings, Filter, Building2, Info, Mail } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { usePropertyType } from "@/contexts/PropertyTypeContext";
import gsap from "gsap";

const MobileNavButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { propertyType } = usePropertyType();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLButtonElement[]>([]);

  // Only show on home page and mobile screens
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (!isHomePage) return;

    const handleResize = () => {
      // Only show on mobile screens (below 700px)
      if (window.innerWidth >= 700) {
        setIsExpanded(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isHomePage]);

  // Collapse on scroll
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      if (isExpanded) {
        setIsExpanded(false);
      }
    };

    // Use passive listener for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage, isExpanded]);

  useEffect(() => {
    if (!containerRef.current) return;

    const buttons = buttonsRef.current.filter(Boolean);
    const spacing = [60, 120, 180, 240]; // Different spacings for each button
    
    if (isExpanded) {
      // Expand animation
      gsap.fromTo(
        buttons,
        {
          opacity: 0,
          scale: 0.5,
          y: 0,
          x: -20,
        },
        {
          opacity: 1,
          scale: 1,
          y: (index) => -spacing[index],
          x: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "back.out(1.4)",
          clearProps: "background-color", // Ensure CSS background-color is not overridden
        }
      );
    } else {
      // Collapse animation
      gsap.to(buttons, {
        opacity: 0,
        scale: 0.5,
        y: 0,
        x: -20,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.in",
        clearProps: "background-color", // Ensure CSS background-color is not overridden
      });
    }

    return () => {
      gsap.killTweensOf(buttons);
    };
  }, [isExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleButtonClick = (action: () => void) => {
    setIsExpanded(false);
    setTimeout(() => {
      action();
    }, 200);
  };

  const handleFilter = () => {
    // Navigate to properties page and open filter section
    if (propertyType === "lands") {
      router.push("/properties?propertyType=Plot&openFilters=true");
    } else {
      router.push("/properties?openFilters=true");
    }
  };

  const handleProperties = () => {
    if (propertyType === "lands") {
      router.push("/properties?propertyType=Plot");
    } else {
      router.push("/properties");
    }
  };

  const handleAbout = () => {
    router.push("/about");
  };

  const handleContact = () => {
    router.push("/contact");
  };

  // Don't render if not on home page
  if (!isHomePage) {
    return null;
  }

  return (
    <div className="mobile-nav-button" ref={containerRef}>
      {/* Expanded Buttons - Always rendered for smooth animations */}
      <button
        className={`mobile-nav-button__item mobile-nav-button__item--contact ${!isExpanded ? "mobile-nav-button__item--hidden" : ""}`}
        onClick={() => handleButtonClick(handleContact)}
        ref={(el) => {
          if (el) buttonsRef.current[3] = el;
        }}
        aria-label="Contact Us"
        aria-hidden={!isExpanded}
        tabIndex={isExpanded ? 0 : -1}
      >
        <Mail size={20} />
        <span>Contact Us</span>
      </button>
      
      <button
        className={`mobile-nav-button__item mobile-nav-button__item--about ${!isExpanded ? "mobile-nav-button__item--hidden" : ""}`}
        onClick={() => handleButtonClick(handleAbout)}
        ref={(el) => {
          if (el) buttonsRef.current[2] = el;
        }}
        aria-label="About Us"
        aria-hidden={!isExpanded}
        tabIndex={isExpanded ? 0 : -1}
      >
        <Info size={20} />
        <span>About Us</span>
      </button>
      
      <button
        className={`mobile-nav-button__item mobile-nav-button__item--properties ${!isExpanded ? "mobile-nav-button__item--hidden" : ""}`}
        onClick={() => handleButtonClick(handleProperties)}
        ref={(el) => {
          if (el) buttonsRef.current[1] = el;
        }}
        aria-label="Properties"
        aria-hidden={!isExpanded}
        tabIndex={isExpanded ? 0 : -1}
      >
        <Building2 size={20} />
        <span>{propertyType === "lands" ? "Lands" : "Properties"}</span>
      </button>
      
      <button
        className={`mobile-nav-button__item mobile-nav-button__item--filter ${!isExpanded ? "mobile-nav-button__item--hidden" : ""}`}
        onClick={() => handleButtonClick(handleFilter)}
        ref={(el) => {
          if (el) buttonsRef.current[0] = el;
        }}
        aria-label="Filter"
        aria-hidden={!isExpanded}
        tabIndex={isExpanded ? 0 : -1}
      >
        <Filter size={20} />
        <span>Filter</span>
      </button>

      {/* Main Settings Button */}
      <button
        className={`mobile-nav-button__main ${isExpanded ? "mobile-nav-button__main--expanded" : ""}`}
        onClick={toggleExpanded}
        aria-label="Toggle navigation"
        aria-expanded={isExpanded}
      >
        <Settings size={24} className={isExpanded ? "rotate" : ""} />
      </button>
    </div>
  );
};

export default MobileNavButton;
