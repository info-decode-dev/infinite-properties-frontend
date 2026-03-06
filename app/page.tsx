"use client";

import CuratedCollections from "@/components/Home/CuratedCollections";
import QuickCollections from "@/components/Home/QuickCollections";
import ReelsCollectionsCarousel from "@/components/Home/ReelsCollectionsCarousel";
import AboutUs from "@/components/website-ui-components/AboutUs";
import Testimonials from "@/components/website-ui-components/Testimonials";
import Hero from "@/components/website-ui-components/Hero";
import StickyNavbar from "@/components/website-ui-components/StickyNavbar";
import MobileNavButton from "@/components/website-ui-components/MobileNavButton";
import { PropertyTypeProvider } from "@/contexts/PropertyTypeContext";

export default function Home() {
  return (
    <PropertyTypeProvider>
      <StickyNavbar />
      <Hero />
      <div className="page-content-container">
      <QuickCollections
        title="Explore Our curated collection"
        subtitle="properties types"
      />
      <CuratedCollections />
      <ReelsCollectionsCarousel />
      <AboutUs />
      </div>
      <Testimonials />
      <MobileNavButton />
    </PropertyTypeProvider>
  );
}
