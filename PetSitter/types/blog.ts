export interface Author {
  userId: string;
  fullName: string;
  profilePictureUrl: string;
  role: number;
  dateOfBirth: string;
  address: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  shop: {
    shopId: string;
    userId: string;
    shopName: string;
    description: string;
    address: string;
    location: string;
    socialMediaLinks: string | null;
    shopImageUrl: string | null;
    createdAt: string;
    updatedAt: string;
    products: any[];
    services: any[];
  } | null;
  blogs: any[];
  reviews: any[];
  serviceReviews: any[];
  orders: any[];
  pets: any[];
  bookings: any[];
  blogLikes: any[];
}

export interface BlogTag {
  blogTagId: string;
  blogTagName: string;
  blogs: any[];
}

export interface ServiceReview {
  reviewId: string;
  userId: string;
  serviceId: string;
  rating: number;
  comment: string;
  createdAt: string;
  users: {
    userId: string;
    fullName: string;
    profilePictureUrl: string;
  } | null;
}

export interface Blog {
  blogId: string;
  authorId: string;
  tagId: string;
  categoryId: string;
  title: string;
  content: string;
  readTimeMinutes: number;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  author: Author;
  blogTag: BlogTag;
  categories: any | null;
  blogLikes: any[];
  featuredImageUrl: string | null;
}

export type BlogFilters = {
  category: string;
  searchQuery: string;
  tagId: string | null;
};

export interface BlogDetailDTO {
  blogId: string;
  title: string;
  content: string;
  tagName: string;
  readTimeMinutes: number;
  viewCount: number;
  likeCount: number;
  hasUserLiked: boolean;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorExperience: string;
  featuredImageUrl: string | null;
}