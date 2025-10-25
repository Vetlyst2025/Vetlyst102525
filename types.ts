export interface Clinic {
  name: string;
  address: string;
  city: string;
  phone: string;
  categories: string[];
  photoUrl?: string;
  hours?: string;
  websiteUrl?: string;
  googleRating?: number;
  googleReviewCount?: number;
  googleMapsUrl?: string;
}
