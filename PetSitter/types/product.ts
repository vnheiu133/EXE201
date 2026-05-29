import { Review } from "./review";

export interface Product {
  productId: string;
  productName: string;
  price: number;
  productImageUrl: string;
  categoryName: string;
  brandName: string;
  tags: string[];
  description: string;
  availabilityStatus: boolean;
  rating: number;
  categoryId?: string;
  brandId?: string;
  tagId?: string; 
  reviews: Review[];
  stockQuantity?: number;
  shopId?: string;
  shopName?: string;
  shopImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  categories: string[];
  priceRange: [number, number];
  brands: string[];
  tags: string[]; // list productTagId đang chọn
  sortBy: "latest" | "price-low" | "price-high" | "rating";
}