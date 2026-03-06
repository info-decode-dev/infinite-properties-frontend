export interface CuratedCollection {
  id: string;
  title: string;
  image: string;
  propertyCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CuratedCollectionFormData {
  title: string;
  image: File;
}

export interface Reel {
  id: string;
  link: string;
  title: string;
  description?: string;
  actionButtonLink?: string; // Link to property or property details page
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReelFormData {
  link: string;
  title: string;
  description?: string;
  actionButtonLink?: string;
}

