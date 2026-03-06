export interface AboutUs {
  id: string;
  companyName: string;
  tagline?: string;
  mission?: string;
  vision?: string;
  story?: string;
  values?: string[];
  statistics?: Statistic[];
  achievements?: Achievement[];
  teamMembers?: TeamMember[];
  contactInfo?: ContactInfo;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Statistic {
  id: string;
  label: string;
  value: string;
  icon?: string;
  suffix?: string; // e.g., "+", "years", "sqft", etc.
  prefix?: string; // e.g., "$", etc.
}

export interface Achievement {
  id: string;
  title: string;
  value: string;
  icon?: string;
  description?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio?: string;
  image?: string;
  email?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export interface AboutUsFormData {
  companyName: string;
  tagline?: string;
  mission?: string;
  vision?: string;
  story?: string;
  values?: string[];
  statistics?: Statistic[];
  achievements?: Achievement[];
  teamMembers?: TeamMember[];
  contactInfo?: ContactInfo;
  images?: File[];
}

