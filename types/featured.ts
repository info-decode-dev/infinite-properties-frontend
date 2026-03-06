export interface FeaturedProperty {
  id: string;
  title: string;
  description?: string;
  media: {
    type: "image" | "video";
    url: string;
  };
  clientLogos: string[]; // Array of logo URLs
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FeaturedPropertyFormData {
  title: string;
  description?: string;
  gallery?: {
    type: "image" | "video";
    file: File;
  }[];
  existingGallery?: string[]; // Array of gallery item IDs to keep
  clientLogos?: File[]; // Array of logo files
  existingClientLogos?: string[]; // Array of existing logo URLs
}

