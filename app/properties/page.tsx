"use client";

import { Suspense } from "react";
import PropertyListing from "@/components/website-ui-components/PropertyListing";
import { PropertyTypeProvider } from "@/contexts/PropertyTypeContext";

function PropertyListingWrapper() {
  return <PropertyListing />;
}

export default function PropertiesPage() {
  return (
    <PropertyTypeProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <PropertyListingWrapper />
      </Suspense>
    </PropertyTypeProvider>
  );
}
