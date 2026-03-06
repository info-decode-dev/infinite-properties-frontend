import { Property } from "./property";

export interface Enquiry {
  id: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  message?: string;
  propertyId: string;
  property: Property;
  status: "pending" | "contacted" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

export interface EnquiryStats {
  total: number;
  pending: number;
  contacted: number;
  closed: number;
  monthlyData: { [key: string]: number };
}

export interface CreateEnquiryData {
  userName: string;
  userEmail: string;
  userPhone?: string;
  message?: string;
  propertyId: string;
}

export interface EnquiryFilters {
  status?: "pending" | "contacted" | "closed";
  propertyId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "userName" | "userEmail" | "status";
  sortOrder?: "asc" | "desc";
}

