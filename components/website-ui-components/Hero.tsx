"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Navbar from "./Navbar";
import HeroFilter from "./HeroFilter";
import PropertyTypeToggle from "./PropertyTypeToggle";
import gsap from "gsap";
import { usePropertyType } from "@/contexts/PropertyTypeContext";

interface FilterData {
  location: string;
  bhkType: string;
  constructionStatus: string;
  price: string;
}

const Hero = () => {
  const { propertyType, setPropertyType } = usePropertyType();
  const heroRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const backgroundImage1Ref = useRef<HTMLImageElement>(null);
  const backgroundImage2Ref = useRef<HTMLImageElement>(null);
  const cloudLeftRef = useRef<HTMLDivElement>(null);
  const cloudRightRef = useRef<HTMLDivElement>(null);
  const cloudTopRightRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const radialGradientRef = useRef<HTMLDivElement>(null);
  const cloudAnimationsRef = useRef<gsap.core.Tween[]>([]);
  const previousPropertyTypeRef = useRef<"properties" | "lands">("properties");

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set([badgeRef.current, titleRef.current, filterRef.current, toggleRef.current], {
        opacity: 0,
        y: 50,
      });

      gsap.set(radialGradientRef.current, {
        opacity: 0,
        scale: 0.8,
      });

      gsap.set(backgroundRef.current, {
        scale: 1.2,
      });

      [cloudLeftRef.current, cloudRightRef.current, cloudTopRightRef.current].forEach(
        (cloud, index) => {
          if (cloud) {
            gsap.set(cloud, {
              opacity: 0,
              y: index % 2 === 0 ? -30 : 30,
              x: index % 2 === 0 ? -20 : 20,
            });
          }
        }
      );

      // Create master timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Background image zoom in
      tl.to(backgroundRef.current, {
        scale: 1,
        duration: 1.5,
        ease: "power2.out",
      });

      // Radial gradient fade in with scale
      tl.to(
        radialGradientRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power2.out",
        },
        "-=1"
      );

      // Clouds floating animation (staggered)
      [cloudLeftRef.current, cloudRightRef.current, cloudTopRightRef.current].forEach(
        (cloud) => {
          if (cloud) {
            tl.to(
              cloud,
              {
                opacity: 0.8,
                y: 0,
                x: 0,
                duration: 1.5,
                ease: "power2.out",
              },
              "-=1.2"
            );
          }
        }
      );

      // Content animations (staggered)
      tl.to(
        badgeRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "back.out(1.7)",
        },
        "-=0.8"
      )
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
          },
          "-=0.6"
        )
        .to(
          filterRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
          },
          "-=0.8"
        )
        .to(
          toggleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.6"
        );

      // Continuous floating animation for clouds
      [cloudLeftRef.current, cloudRightRef.current, cloudTopRightRef.current].forEach(
        (cloud, idx) => {
          if (cloud) {
            const anim = gsap.to(cloud, {
              y: `+=${(idx % 2 === 0 ? -1 : 1) * 20}`,
              x: `+=${(idx % 2 === 0 ? -1 : 1) * 15}`,
              duration: 3 + idx,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              delay: 2 + idx * 0.3,
            });
            cloudAnimationsRef.current.push(anim);
          }
        }
      );

    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Separate scroll handler that updates when propertyType changes
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current || !backgroundRef.current) return;

      const heroHeight = heroRef.current.offsetHeight;
      const scrolled = window.scrollY;
      const scrollProgress = Math.min(scrolled / heroHeight, 1);

      // Background image dissolve with zoom in then zoom out
      const currentImage = propertyType === "properties" 
        ? backgroundImage1Ref.current 
        : backgroundImage2Ref.current;
      
      if (currentImage && backgroundRef.current) {
        // Zoom in first (0-50% scroll), then zoom out (50-100% scroll)
        let scale;
        if (scrollProgress <= 0.5) {
          // Zoom in: scale from 1 to 1.3
          scale = 1 + scrollProgress * 0.6; // 1 to 1.3
        } else {
          // Zoom out: scale from 1.3 to 0.7
          scale = 1.3 - (scrollProgress - 0.5) * 1.2; // 1.3 to 0.7
        }
        
        gsap.to(backgroundRef.current, {
          scale: scale,
          duration: 0.1,
          ease: "none",
        });

        const opacity = 1 - scrollProgress;
        gsap.to(currentImage, {
          opacity: Math.max(0, opacity),
          duration: 0.1,
          ease: "none",
        });

        const parallaxValue = scrolled * 0.5;
        gsap.to(backgroundRef.current, {
          y: parallaxValue,
          duration: 0.1,
          ease: "none",
        });
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [propertyType]);

  const handleFilterChange = (newFilters: FilterData) => {
    // You can add navigation or filtering logic here
    console.log("Hero filters:", newFilters);
  };

  // Animation for toggle switch (works both ways)
  useEffect(() => {
    // Skip initial mount animation
    if (previousPropertyTypeRef.current === propertyType) {
      return;
    }

    if (heroRef.current && backgroundImage1Ref.current && backgroundImage2Ref.current) {
      const ctx = gsap.context(() => {
        const clouds = [
          cloudLeftRef.current,
          cloudRightRef.current,
          cloudTopRightRef.current,
        ].filter(Boolean) as HTMLDivElement[];

        // Kill existing cloud animations
        cloudAnimationsRef.current.forEach((anim) => anim.kill());
        cloudAnimationsRef.current = [];

        const isLands = propertyType === "lands";
        const fromImage = isLands ? backgroundImage1Ref.current : backgroundImage2Ref.current;
        const toImage = isLands ? backgroundImage2Ref.current : backgroundImage1Ref.current;

        // Ensure proper initial state
        if (isLands) {
          gsap.set(backgroundImage1Ref.current, { opacity: 1, zIndex: 1 });
          gsap.set(backgroundImage2Ref.current, { opacity: 0, zIndex: 0 });
        } else {
          gsap.set(backgroundImage1Ref.current, { opacity: 0, zIndex: 0 });
          gsap.set(backgroundImage2Ref.current, { opacity: 1, zIndex: 1 });
        }

        // Create timeline for transition
        const tl = gsap.timeline();

        // Step 1: Scale up clouds and move them faster across screen
        clouds.forEach((cloud, idx) => {
          if (cloud) {
            const direction = idx === 0 ? -1 : idx === 1 ? 1 : 1; // left goes left, others go right
            const startX = (gsap.getProperty(cloud, "x") as number) || 0;
            const startY = (gsap.getProperty(cloud, "y") as number) || 0;

            tl.to(
              cloud,
              {
                scale: 1.5,
                duration: 0.5,
                ease: "power2.out",
              },
              0
            )
              .to(
                cloud,
                {
                  x: startX + direction * window.innerWidth * 1.5,
                  y: startY + (idx % 2 === 0 ? -100 : 100),
                  opacity: 0,
                  duration: 1.5,
                  ease: "power2.in",
                },
                0.3
              );
          }
        });

        // Step 2: Crossfade background images with proper z-index management
        tl.set(toImage, { zIndex: 1 }, 0.5)
          .to(
            fromImage,
            {
              opacity: 0,
              duration: 1.2,
              ease: "power2.inOut",
            },
            0.5
          )
          .to(
            toImage,
            {
              opacity: 1,
              duration: 1.2,
              ease: "power2.inOut",
            },
            0.5
          )
          .set(fromImage, { zIndex: 0 }, 1.7);

        // Step 3: Reset clouds position and bring them back
        tl.call(() => {
          clouds.forEach((cloud, idx) => {
            if (cloud) {
              const direction = idx === 0 ? 1 : idx === 1 ? -1 : -1; // Reverse direction
              gsap.set(cloud, {
                x: direction * window.innerWidth * 1.5,
                y: idx % 2 === 0 ? -100 : 100,
                opacity: 0,
                scale: 1,
              });

              // Animate clouds back in
              gsap.to(cloud, {
                x: 0,
                y: 0,
                opacity: 0.8,
                scale: 1,
                duration: 1.5,
                ease: "power2.out",
                delay: 1.5 + idx * 0.2,
              });

              // Restart floating animation
              const anim = gsap.to(cloud, {
                y: `+=${(idx % 2 === 0 ? -1 : 1) * 20}`,
                x: `+=${(idx % 2 === 0 ? -1 : 1) * 15}`,
                duration: 3 + idx,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: 3 + idx * 0.3,
              });
              cloudAnimationsRef.current.push(anim);
            }
          });
        });
      }, heroRef);

      // Update previous property type after animation starts
      previousPropertyTypeRef.current = propertyType;

      return () => ctx.revert();
    }
  }, [propertyType]);

  const handlePropertyTypeChange = (type: "properties" | "lands") => {
    setPropertyType(type);
    // You can add logic here to filter properties/lands based on type
    console.log("Property type changed to:", type);
  };

  return (
    <section ref={heroRef} className="hero-section">
      <Navbar />
      <div ref={backgroundRef} className="hero-background">
        <div ref={backgroundImage1Ref} className="hero-image-wrapper hero-image-properties">
          <Image
            src="/assets/images/hero-kochi.png"
            alt="Hero background - Properties"
            fill
            priority
            className="hero-image"
          />
        </div>
        <div ref={backgroundImage2Ref} className="hero-image-wrapper hero-image-lands">
          <Image
            src="/assets/images/hero-plot2.png"
            alt="Hero background - Lands"
            fill
            className="hero-image"
          />
        </div>
      </div>
      <div ref={cloudLeftRef} className="hero-cloud hero-cloud-left">
        <Image
          src="/assets/images/cloud.png"
          alt="Cloud decoration"
          width={200}
          height={150}
          className="cloud-image"
        />
      </div>
      <div ref={cloudRightRef} className="hero-cloud hero-cloud-right">
        <Image
          src="/assets/images/cloud.png"
          alt="Cloud decoration"
          width={200}
          height={150}
          className="cloud-image"
        />
      </div>
      <div ref={cloudTopRightRef} className="hero-cloud hero-cloud-top-right">
        <Image
          src="/assets/images/cloud.png"
          alt="Cloud decoration"
          width={200}
          height={150}
          className="cloud-image"
        />
      </div>
      <div ref={radialGradientRef} className="hero-radial-gradient"></div>
      <div className="hero-content">
        <div ref={badgeRef} className="hero-badge">
          INFINITE PROPERTIES
        </div>
        <h1 ref={titleRef} className="hero-title">
          Discover your <span className="hero-title-italic">Perfect</span>{" "}
          {propertyType === "properties" ? "Home" : "Lands"}
        </h1>
        <div ref={filterRef} className="hero-filter">
          <HeroFilter propertyType={propertyType} onFilterChange={handleFilterChange} />
        </div>
      </div>
      <div ref={toggleRef} className="hero-toggle-container">
        <PropertyTypeToggle value={propertyType} onChange={handlePropertyTypeChange} />
      </div>
    </section>
  );
};

export default Hero;
