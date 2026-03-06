export interface Testimonial {
  id: string;
  title: string;
  description?: string;
  clientName: string;
  profilePicture?: string;
  propertyMedia?: {
    type: "image" | "video";
    url: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TestimonialFormData {
  title: string;
  description?: string;
  clientName: string;
  profilePicture?: File;
  propertyMedia?: {
    type: "image" | "video";
    file: File;
  };
}

