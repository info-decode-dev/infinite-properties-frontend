"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useMap } from "react-leaflet";
import { MapPin } from "lucide-react";

// Dynamically import leaflet components with SSR disabled
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Create custom icon function that only runs on client
const createCustomIcon = (isEditable: boolean = false) => {
  if (typeof window === "undefined") return null;
  
  const L = require("leaflet");
  
  // Create a custom SVG icon for better appearance
  const iconHtml = `
    <div style="
      background-color: ${isEditable ? '#3b82f6' : '#ef4444'};
      width: 40px;
      height: 40px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 18px;
        font-weight: bold;
      ">📍</div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});
};

interface LocationMapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lng: number) => void;
  height?: string;
  address?: string;
  city?: string;
  state?: string;
  editable?: boolean;
}

function MapUpdater({ center, onLocationChange, editable, address, city, state }: { 
  center: [number, number]; 
  onLocationChange?: (lat: number, lng: number) => void; 
  editable?: boolean;
  address?: string;
  city?: string;
  state?: string;
}) {
  const map = useMap();
  const markerRef = useRef<any>(null);
  const clickHandlerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Wait for map to be fully initialized
    if (!map) {
      return;
    }
    
    // Check if map container is ready
    let retryCount = 0;
    const maxRetries = 10;
    
    const checkMapReady = () => {
      try {
        if (map && map.getPane && typeof map.getPane === 'function') {
          const mapPane = map.getPane('mapPane');
          if (mapPane) {
            setIsMapReady(true);
            return;
          }
        }
        
        // Retry if not ready yet and haven't exceeded max retries
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkMapReady, 100);
        }
      } catch (error) {
        // Retry if not ready yet and haven't exceeded max retries
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkMapReady, 100);
        }
      }
    };
    
    checkMapReady();
    
    return () => {
      retryCount = maxRetries; // Stop retries on cleanup
    };
  }, [map]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isMapReady || !map) return;
    if (typeof map.setView !== "function") return;
    
    // Additional safety check for map panes
    try {
      if (!map.getPane || typeof map.getPane !== 'function') {
        return;
      }
      const mapPane = map.getPane('mapPane');
      if (!mapPane) {
        return;
      }
    } catch (error) {
      // Map panes not ready yet
      console.warn('Map panes not ready:', error);
      return;
    }

    const L = require("leaflet");
    const icon = createCustomIcon(editable);
    if (!icon) return;

    // Set view to center with appropriate zoom
    if (editable) {
      map.setView(center, 15); // Higher zoom for editing
    } else {
      map.setView(center, 13); // Standard zoom for viewing
    }

    // Clean up previous marker and handlers
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
    if (clickHandlerRef.current) {
      map.off("click", clickHandlerRef.current);
    }

    if (editable && onLocationChange) {
      // Create draggable marker for editing
      const marker = L.marker(center, { 
        icon, 
        draggable: true,
        zIndexOffset: 1000
      });
      marker.addTo(map);

      // Handle marker drag
      marker.on("dragend", (e: any) => {
        const position = e.target.getLatLng();
        onLocationChange(position.lat, position.lng);
      });

      // Handle map click to move marker
      clickHandlerRef.current = (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onLocationChange(lat, lng);
      };
      map.on("click", clickHandlerRef.current);

      markerRef.current = marker;
    } else {
      // Create non-draggable marker for display
      const marker = L.marker(center, { 
        icon,
        zIndexOffset: 1000
      });
      marker.addTo(map);

      // Create popup content with address information
      let popupContent = `
        <div style="padding: 8px; min-width: 200px;">
          <div style="font-weight: 600; margin-bottom: 4px; color: #1f2937;">
            ${address || "Property Location"}
          </div>
          ${city && state ? `
            <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 4px;">
              ${city}, ${state}
            </div>
          ` : ''}
          <div style="font-size: 0.75rem; color: #9ca3af; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            📍 ${center[0].toFixed(6)}, ${center[1].toFixed(6)}
          </div>
          </div>
        `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      // Open popup by default
      marker.openPopup();

      markerRef.current = marker;
    }

    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      if (clickHandlerRef.current) {
        map.off("click", clickHandlerRef.current);
      }
    };
  }, [center, map, onLocationChange, editable, address, city, state]);

  return null;
}

export default function LocationMap({
  latitude,
  longitude,
  onLocationChange,
  height = "400px",
  address,
  city,
  state,
  editable = false,
}: LocationMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Dynamically import CSS only on client side
    if (typeof window !== "undefined") {
      import("leaflet/dist/leaflet.css");
    }
  }, []);

  if (!isClient) {
    return (
      <div
        className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
      </div>
    );
  }

  const center: [number, number] = [latitude, longitude];

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow-lg" style={{ height }}>
      <style jsx global>{`
        .custom-marker-icon {
          background: transparent !important;
          border: none !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={editable ? 15 : 13}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={editable}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater 
          center={center} 
          onLocationChange={onLocationChange} 
          editable={editable}
          address={address}
          city={city}
          state={state}
        />
      </MapContainer>
    </div>
  );
}

