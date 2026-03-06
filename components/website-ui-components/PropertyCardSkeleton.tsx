import React from "react";

export default function PropertyCardSkeleton() {
  return (
    <div className="property-card property-card--skeleton">
      <div className="property-card__image">
        <div className="skeleton skeleton--image"></div>
        {/* Location skeleton */}
        <div className="skeleton skeleton--location-top"></div>
        {/* Tags skeleton */}
        <div className="skeleton skeleton--tags">
          <div className="skeleton skeleton--tag"></div>
          <div className="skeleton skeleton--tag"></div>
        </div>
        {/* Content skeleton */}
        <div className="property-card__content">
          <div className="skeleton skeleton--title"></div>
          <div className="skeleton skeleton--price"></div>
        </div>
      </div>
    </div>
  );
}

