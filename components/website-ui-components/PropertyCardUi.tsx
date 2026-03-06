import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  MapPin, Bed, Bath, Waves, Star, Phone, Check,
  Car, Dumbbell, Shield, Trees, Wifi, Wind, ArrowUpDown, Baby, Building,
  Battery, Zap, Droplet, Flame, Camera, Video, Book, Heart, Utensils,
  ShoppingBag, Hospital, GraduationCap, School, Building2, Wallet, Gamepad2,
  Flower, Sprout, Lock, AirVent, Users, ChefHat, Stethoscope
} from "lucide-react";
import { Property } from "@/types/property";

interface PropertyCardUiProps {
  property: Property;
}

export default function PropertyCardUi({ property }: PropertyCardUiProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(false);
  
  // Format price with rupee symbol
  // Format price in Indian format (lakhs and crores)
  const formatPrice = (price: number) => {
    // Convert to Indian number format
    if (price >= 10000000) {
      // Crores (1 crore = 10,000,000)
      const crores = price / 10000000;
      return `₹${crores.toFixed(crores % 1 === 0 ? 0 : 1)}cr`;
    } else if (price >= 100000) {
      // Lakhs (1 lakh = 100,000)
      const lakhs = price / 100000;
      return `₹${lakhs.toFixed(lakhs % 1 === 0 ? 0 : 1)}L`;
    } else {
      // Less than 1 lakh, show in thousands
      const thousands = price / 1000;
      if (thousands >= 1) {
        return `₹${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}K`;
      }
      return `₹${price.toLocaleString("en-IN")}`;
    }
  };

  // Get display price (offer price if available, otherwise actual price)
  const displayPrice = property.offerPrice || property.actualPrice;
  const hasOffer =
    property.offerPrice && property.offerPrice < property.actualPrice;

  // Format location - full location for bottom section
  const locationText = property.location.exactLocation 
    ? property.location.exactLocation
    : `${property.location.city}, ${property.location.state}, ${property.location.country || ""}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '');

  // Format location for top - state, country format
  const topLocationText = `${property.location.state || ""}${property.location.state && property.location.country ? ", " : ""}${property.location.country || ""}`.replace(/^,\s*/, '').replace(/,\s*$/, '');

  // Map amenity names to icons
  const getAmenityIcon = (name: string) => {
    const lowerName = name.toLowerCase();

    // Bedrooms & Bathrooms
    if (lowerName.includes("bed") || lowerName.includes("bedroom")) return Bed;
    if (lowerName.includes("bath") || lowerName.includes("bathroom")) return Bath;

    // Water & Pool
    if (lowerName.includes("pool") || lowerName.includes("swimming")) return Waves;
    if (lowerName.includes("water") || lowerName.includes("water supply")) return Droplet;

    // Parking & Transportation
    if (lowerName.includes("parking") || lowerName.includes("car park")) return Car;

    // Fitness & Recreation
    if (lowerName.includes("gym") || lowerName.includes("fitness") || lowerName.includes("workout")) return Dumbbell;
    if (lowerName.includes("playground") || lowerName.includes("play area") || lowerName.includes("kids")) return Baby;
    if (lowerName.includes("garden") || lowerName.includes("landscaping") || lowerName.includes("green")) return Trees;
    if (lowerName.includes("spa") || lowerName.includes("wellness")) return Heart;

    // Security & Safety
    if (lowerName.includes("security") || lowerName.includes("guard") || lowerName.includes("watchman")) return Shield;
    if (lowerName.includes("cctv") || lowerName.includes("surveillance") || lowerName.includes("camera")) return Camera;
    if (lowerName.includes("fire") || lowerName.includes("safety")) return Flame;
    if (lowerName.includes("lock") || lowerName.includes("secure")) return Lock;

    // Technology & Utilities
    if (lowerName.includes("wifi") || lowerName.includes("internet") || lowerName.includes("wi-fi")) return Wifi;
    if (lowerName.includes("ac") || lowerName.includes("air conditioning") || lowerName.includes("air condition")) return Wind;
    if (lowerName.includes("power") || lowerName.includes("backup") || lowerName.includes("generator") || lowerName.includes("electricity")) return Zap;
    if (lowerName.includes("lift") || lowerName.includes("elevator")) return ArrowUpDown;

    // Community & Facilities
    if (lowerName.includes("clubhouse") || lowerName.includes("club house") || lowerName.includes("community")) return Building;
    if (lowerName.includes("library") || lowerName.includes("reading")) return Book;
    if (lowerName.includes("restaurant") || lowerName.includes("dining") || lowerName.includes("cafe")) return Utensils;
    if (lowerName.includes("shopping") || lowerName.includes("mall") || lowerName.includes("store")) return ShoppingBag;
    if (lowerName.includes("hospital") || lowerName.includes("medical") || lowerName.includes("clinic")) return Hospital;
    if (lowerName.includes("school") || lowerName.includes("education")) return School;
    if (lowerName.includes("bank") || lowerName.includes("atm") || lowerName.includes("finance")) return Building2;

    // Other amenities
    if (lowerName.includes("star") || lowerName.includes("rating")) return Star;
    if (lowerName.includes("phone") || lowerName.includes("contact") || lowerName.includes("intercom")) return Phone;
    if (lowerName.includes("check") || lowerName.includes("verified")) return Check;
    if (lowerName.includes("game") || lowerName.includes("recreation") || lowerName.includes("entertainment")) return Gamepad2;
    if (lowerName.includes("flower") || lowerName.includes("floral")) return Flower;
    if (lowerName.includes("sprout") || lowerName.includes("plant")) return Sprout;
    if (lowerName.includes("video") || lowerName.includes("tv")) return Video;
    if (lowerName.includes("air") || lowerName.includes("ventilation")) return AirVent;
    if (lowerName.includes("users") || lowerName.includes("people") || lowerName.includes("community center")) return Users;
    if (lowerName.includes("chef") || lowerName.includes("kitchen")) return ChefHat;
    if (lowerName.includes("stethoscope") || lowerName.includes("doctor")) return Stethoscope;
    if (lowerName.includes("graduation") || lowerName.includes("college") || lowerName.includes("university")) return GraduationCap;
    if (lowerName.includes("wallet") || lowerName.includes("payment")) return Wallet;
    if (lowerName.includes("battery") || lowerName.includes("backup power")) return Battery;

    return null;
  };

  // Extract bedroom count from bhkType
  const getBedroomCount = () => {
    if (!property.bhkType) return null;
    const match = property.bhkType.match(/(\d+)/);
    return match ? match[1] : null;
  };

  // Get amenities to display
  const getDisplayAmenities = () => {
    const amenities: Array<{ name: string; icon: React.ComponentType<{ className?: string }> | null }> = [];

    // Add bedroom from bhkType
    const bedroomCount = getBedroomCount();
    if (bedroomCount) {
      amenities.push({
        name: `${bedroomCount} bedroom${bedroomCount !== "1" ? "s" : ""}`,
        icon: Bed,
      });
    }

    // Add amenities from property.amenities array
    property.amenities?.forEach((amenity) => {
      const icon = getAmenityIcon(amenity.name);
      // Avoid duplicates (e.g., if bedroom is already added from bhkType)
      const isDuplicate = amenities.some(
        (a) => a.name.toLowerCase().includes(amenity.name.toLowerCase()) ||
          amenity.name.toLowerCase().includes(a.name.toLowerCase())
      );
      if (!isDuplicate) {
        amenities.push({
          name: amenity.name,
          icon: icon,
        });
      }
    });

    return amenities; // Show all amenities
  };

  const displayAmenities = getDisplayAmenities();

  // Get image URL - prepend API URL if it's a relative path
  const getImageUrl = () => {
    if (!property.images || property.images.length === 0) {
      return "/placeholder-property.jpg";
    }

    const imagePath = property.images[0];

    // If it's already a full URL, use it as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // If it's a relative path, prepend API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${apiUrl}${imagePath}`;
  };

  const imageUrl = getImageUrl();

  // Parallax effect on scroll
  useEffect(() => {
    const image = imageRef.current;
    const card = cardRef.current;
    if (!image || !card) return;

    // Intersection Observer to detect when card is in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(card);

    // Parallax scroll handler
    const handleScroll = () => {
      if (!isVisibleRef.current) {
        // Reset transform when not visible
        image.style.transform = "translateY(0px)";
        return;
      }

      const rect = card.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const cardTop = rect.top;
      const cardHeight = rect.height;

      // Calculate scroll progress based on card position in viewport
      // When card is at top of viewport: progress = 1
      // When card is at bottom of viewport: progress = 0
      const scrollProgress = Math.max(
        0,
        Math.min(1, (windowHeight - cardTop) / (windowHeight + cardHeight))
      );

      // Parallax offset (adjust multiplier for stronger/weaker effect)
      // Moves from -40px (top) to +40px (bottom) for more pronounced parallax
      const parallaxOffset = (scrollProgress - 0.5) * 80; // 80px max movement for stronger effect

      // Apply smooth transform
      image.style.transform = `translateY(${parallaxOffset}px)`;
    };

    // Throttled scroll handler for performance
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
    handleScroll(); // Initial call

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <Link href={`/properties/${property.id}`} className="property-card__link">
    <div className="property-card" ref={cardRef}>
      <div className="property-card__image">
        <img
          ref={imageRef}
          className="property-card__image-img"
          src={imageUrl}
          alt={property.title}
          onError={(e) => {
            // Fallback to placeholder on error
            (e.target as HTMLImageElement).src = "/placeholder-property.jpg";
          }}
        />
        {/* Location at top center */}
        <div className="property-card__location-top">
          <MapPin className="property-card__location-icon" />
          <span>{topLocationText.toUpperCase()}</span>
        </div>

        {/* Tags at top right */}
        {/* {property.tags && property.tags.length > 0 && (
          <div className="property-card__tags">
            {property.tags.slice(0, 2).map((tag, index) => {
              // Get icon for each tag
              const getTagIcon = () => {
                switch (tag) {
                  case "New":
                    return Sparkles;
                  case "Luxury":
                    return Crown;
                  case "Best Deal":
                    return Tag;
                  case "Featured":
                    return Award;
                  case "Hot Deal":
                    return Flame;
                  default:
                    return FileText;
                }
              };
              const TagIcon = getTagIcon();
              
              return (
                <span key={index} className="property-card__tag">
                  <TagIcon className="property-card__tag-icon" />
                  <span className="property-card__tag-text">{tag}</span>
                </span>
              );
            })}
          </div>
        )} */}

        {/* Content at bottom left */}
        <div className="property-card__content">
          <div className="property-card__header">
            <h3 className={`property-card__title ${property.title.length > 20 ? 'property-card__title--marquee' : ''}`}>
              <span className="property-card__title-text">{property.title}</span>
            </h3>
          <div className="property-card__price">
            <span className="property-card__price--current">
              {formatPrice(displayPrice)}
            </span>
            {hasOffer && (
              <span className="property-card__price--original">
                {formatPrice(property.actualPrice)}
              </span>
            )}
            </div>
          </div>

          <div className="property-card__location">
            <MapPin className="property-card__location-icon" />
            <span className="property-card__location-text">{locationText}</span>
          </div>

          {/* Amenities */}
          {displayAmenities.length > 0 && (
            <div className="property-card__amenities">
              {displayAmenities.map((amenity, index) => {
                const IconComponent = amenity.icon;
                return (
                  <div key={index} className="property-card__amenity">
                    {IconComponent && (
                      <IconComponent className="property-card__amenity-icon" />
                    )}
                    <span className="property-card__amenity-text">{amenity.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    </Link>
  );
}
