export interface Builder {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  profilePicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BuilderFormData {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  profilePicture?: File | string;
}
