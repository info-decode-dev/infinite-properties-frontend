/**
 * Example usage of PropertyMap component
 * 
 * This file demonstrates how to use the PropertyMap component
 * to display properties on a dotted map of South India.
 */

import React from "react";
import PropertyMap from "./PropertyMap";
import { Property } from "@/types/property";

// Example: Using PropertyMap in a page or component
export default function PropertyMapExample() {
  // Example properties data
  const exampleProperties: Property[] = [
    {
      id: "1",
      title: "Luxury Villa in Bangalore",
      description: "Beautiful 3 BHK villa",
      images: [],
      actualPrice: 8500000,
      offerPrice: 8000000,
      location: {
        exactLocation: "Whitefield, Bangalore",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        latitude: 12.9716,
        longitude: 77.5946,
      },
      bhkType: "3 BHK",
      propertyType: "Villa",
      constructionStatus: "Ready to Move",
      tags: ["Luxury", "Featured"],
      amenities: [],
      developerInfo: {
        name: "ABC Developers",
      },
    },
    {
      id: "2",
      title: "Modern Apartment in Chennai",
      description: "Spacious 2 BHK apartment",
      images: [],
      actualPrice: 4500000,
      location: {
        exactLocation: "T. Nagar, Chennai",
        city: "Chennai",
        state: "Tamil Nadu",
        country: "India",
        latitude: 13.0827,
        longitude: 80.2707,
      },
      bhkType: "2 BHK",
      propertyType: "Apartment",
      constructionStatus: "Under Construction",
      tags: ["New"],
      amenities: [],
      developerInfo: {
        name: "XYZ Builders",
      },
    },
    {
      id: "3",
      title: "Premium Flat in Hyderabad",
      description: "Elegant 4 BHK flat",
      images: [],
      actualPrice: 12000000,
      offerPrice: 11500000,
      location: {
        exactLocation: "Gachibowli, Hyderabad",
        city: "Hyderabad",
        state: "Telangana",
        country: "India",
        latitude: 17.4227,
        longitude: 78.3498,
      },
      bhkType: "4 BHK",
      propertyType: "Flat",
      constructionStatus: "Pre-Launch",
      tags: ["Hot Deal", "Featured"],
      amenities: [],
      developerInfo: {
        name: "PQR Constructions",
      },
    },
  ];

  const handlePropertyClick = (property: Property) => {
    console.log("Property clicked:", property);
    // Navigate to property detail page or show modal
    // router.push(`/properties/${property.id}`);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem", fontSize: "2rem", fontWeight: "bold" }}>
        Property Map - South India
      </h1>
      
      <PropertyMap
        properties={exampleProperties}
        height="700px"
        onPropertyClick={handlePropertyClick}
        className="my-custom-map"
      />
    </div>
  );
}
