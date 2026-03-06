"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HeroFilter from "./HeroFilter";
import gsap from "gsap";
import { usePropertyType } from "@/contexts/PropertyTypeContext";

const StickyNavbar = () => {
  const { propertyType } = usePropertyType();
  const [, setIsVisible] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Always show navbar on about page
    const isAboutPage = pathname === "/about";
    
    if (isAboutPage && navbarRef.current) {
      const isSmallScreen = window.innerWidth < 900; // medium breakpoint
      gsap.set(navbarRef.current, {
        y: 0,
        opacity: 1,
        xPercent: isSmallScreen ? 0 : -50,
      });
      return;
    }

    // Find the hero section
    const findHeroSection = () => {
      heroRef.current = document.querySelector("section.hero-section") as HTMLElement;
    };

    findHeroSection();

    // Set initial state
    if (navbarRef.current) {
      const isSmallScreen = window.innerWidth < 900; // medium breakpoint
      gsap.set(navbarRef.current, {
        y: -100,
        opacity: 0,
        xPercent: isSmallScreen ? 0 : -50,
      });
    }

    const handleScroll = () => {
      if (!heroRef.current) {
        findHeroSection();
        if (!heroRef.current) return;
      }

      const heroRect = heroRef.current.getBoundingClientRect();
      const heroHeight = heroRef.current.offsetHeight;
      const heroTop = heroRect.top + window.scrollY;
      const scrolled = window.scrollY;
      
      // Calculate scroll progress relative to hero section
      const scrollProgress = scrolled > heroTop ? (scrolled - heroTop) / heroHeight : 0;

      // Show navbar when scrolled more than 50% of hero section
      const shouldShow = scrollProgress > 0.5;

      setIsVisible((prevVisible) => {
        if (shouldShow !== prevVisible && navbarRef.current) {
          const isSmallScreen = window.innerWidth < 900; // medium breakpoint
          // Animate navbar appearance/disappearance
          if (shouldShow) {
            gsap.to(navbarRef.current, {
              y: 0,
              opacity: 1,
              xPercent: isSmallScreen ? 0 : -50,
              duration: 0.3,
              ease: "power2.out",
            });
          } else {
            gsap.to(navbarRef.current, {
              y: -100,
              opacity: 0,
              xPercent: isSmallScreen ? 0 : -50,
              duration: 0.3,
              ease: "power2.in",
            });
          }
        }
        return shouldShow;
      });
    };

    const handleResize = () => {
      if (navbarRef.current) {
        const isSmallScreen = window.innerWidth < 900; // medium breakpoint
        gsap.set(navbarRef.current, {
          xPercent: isSmallScreen ? 0 : -50,
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    handleScroll(); // Check initial state
    handleResize(); // Set initial transform

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [pathname]);

  return (
    <nav
      ref={navbarRef}
      className="sticky-navbar"
    >
      <div className="sticky-navbar-container">
        <div className="sticky-navbar-top">
          <div className="sticky-navbar-logo">
            <Link href="/">
              <Image
                src="/assets/images/logo.png"
                alt="Logo"
                width={120}
                height={60}
                priority
                className="sticky-logo-image"
              />
            </Link>
            {/* <span className="sticky-brand-label">infinite properties</span> */}
          </div>
          
          {/* Navigation Links - Only for larger screens */}
          <nav className="sticky-navbar-nav">
            <div className="sticky-navbar-divider"></div>
            <Link 
              href="/properties" 
              className={`sticky-nav-link ${pathname === "/properties" ? "sticky-nav-link--active" : ""}`}
            >
              {propertyType === "lands" ? "Lands" : "Properties"}
            </Link>
            <Link 
              href="/about" 
              className={`sticky-nav-link ${pathname === "/about" ? "sticky-nav-link--active" : ""}`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`sticky-nav-link ${pathname === "/contact" ? "sticky-nav-link--active" : ""}`}
            >
              Contact us
            </Link>
          </nav>
        </div>
        <div className="sticky-navbar-filter">
          <HeroFilter propertyType={propertyType} />
        </div>
      </div>
    </nav>
  );
};

export default StickyNavbar;
