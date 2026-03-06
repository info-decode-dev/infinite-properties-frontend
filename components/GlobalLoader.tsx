"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

const GlobalLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const pathname = usePathname();

  // Don't show loader on admin routes
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) {
      setIsLoading(false);
      return;
    }

    // On initial page load
    if (isInitialLoad) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsInitialLoad(false);
      }, 800);
      return () => clearTimeout(timer);
    }

    // On route change
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, isInitialLoad, isAdminRoute]);

  if (!isLoading || isAdminRoute) return null;

  return (
    <div className="global-loader">
      <div className="global-loader__content">
        <div className="global-loader__logo">
          <Image
            src="/assets/images/logo.png"
            alt="Loading..."
            width={200}
            height={100}
            priority
            className="global-loader__logo-image"
          />
        </div>
      </div>
    </div>
  );
};

export default GlobalLoader;
