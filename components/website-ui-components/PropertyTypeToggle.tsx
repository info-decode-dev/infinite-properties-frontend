"use client";

import React from "react";
import { Home, MapPin } from "lucide-react";

type PropertyType = "properties" | "lands";

interface PropertyTypeToggleProps {
  value: PropertyType;
  onChange: (value: PropertyType) => void;
}

const PropertyTypeToggle = ({ value, onChange }: PropertyTypeToggleProps) => {
  return (
    <div className="property-type-toggle">
      <div className={`toggle-slider ${value === "lands" ? "slide-right" : "slide-left"}`}></div>
      <button
        className={`toggle-option ${value === "properties" ? "active" : ""}`}
        onClick={() => onChange("properties")}
        aria-label="Properties"
      >
        <Home className="toggle-icon" />
        <span>Properties</span>
      </button>
      <button
        className={`toggle-option ${value === "lands" ? "active" : ""}`}
        onClick={() => onChange("lands")}
        aria-label="Lands"
      >
        <MapPin className="toggle-icon" />
        <span>Lands</span>
      </button>
    </div>
  );
};

export default PropertyTypeToggle;
