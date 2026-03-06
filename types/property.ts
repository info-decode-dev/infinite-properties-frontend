export type BHKType = "1 BHK" | "2 BHK" | "3 BHK" | "4 BHK" | "5+ BHK" | "Studio";

export type ConstructionStatus = "Ready to Move" | "Under Construction" | "Pre-Launch";

export type PropertyType = "Home" | "Villa" | "Flat" | "Apartment" | "Plot" | "Commercial" | "Farmhouse" | "Bungalow" | "Resort";

export type PropertyTag = "New" | "Luxury" | "Best Deal" | "Featured" | "Hot Deal";

export type FurnishedStatus = "Furnished" | "Semi-Furnished" | "Unfurnished";

export type LandType = "Residential Land" | "Commercial Land" | "Resort Land" | "Agricultural Land" | "Special Purpose Land";

export type PlotSizeUnit = "Cent" | "Acre" | "Square Feet";

export type Ownership = "Freehold" | "Leasehold";

export type Negotiation = "Negotiable" | "Slightly Negotiable" | "Not Negotiable";

export interface Accessibility {
  id?: string;
  name: string;
  distance: number;
  unit: "meter" | "kilometer";
}

export interface Location {
  exactLocation: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface DeveloperInfo {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  images: string[];
  actualPrice: number;
  offerPrice?: number;
  location: Location;
  bhkType?: BHKType;
  propertyType: PropertyType;
  constructionStatus?: ConstructionStatus;
  landArea?: number;
  landAreaUnit?: "cent" | "acre";
  builtUpArea?: number;
  furnishedStatus?: FurnishedStatus;
  negotiation?: Negotiation;
  nearbyLandmarks?: string[];
  accessibility?: Accessibility[];
  tags: PropertyTag[];
  amenities: Amenity[];
  developerInfo?: DeveloperInfo;
  // Plot-specific fields
  landType?: LandType;
  plotSize?: number;
  plotSizeUnit?: PlotSizeUnit;
  ownership?: Ownership;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PropertyFormData {
  title: string;
  description: string;
  images: File[];
  actualPrice: number;
  offerPrice?: number;
  location: Location;
  bhkType?: BHKType;
  propertyType: PropertyType;
  constructionStatus?: ConstructionStatus;
  landArea?: number;
  landAreaUnit?: "cent" | "acre";
  builtUpArea?: number;
  furnishedStatus?: FurnishedStatus;
  negotiation?: Negotiation;
  nearbyLandmarks?: string[];
  accessibility?: Accessibility[];
  tags: PropertyTag[];
  amenities: Amenity[];
  developerInfo?: DeveloperInfo;
  // Plot-specific fields
  landType?: LandType;
  plotSize?: number;
  plotSizeUnit?: PlotSizeUnit;
  ownership?: Ownership;
}

