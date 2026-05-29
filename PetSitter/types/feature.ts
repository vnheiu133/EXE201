export interface Shop {
    shopId: string;
    userId: string;
    shopName: string;
    description: string;
    address: string;
    location: string;
    socialMediaLinks: string;
    shopImageUrl: string | null;
    createdAt: string;
    updatedAt: string;
    user: null | any;
    products: any[];
    services: any[];
}

export interface ServiceReview {
    reviewId: string;
    userId: string;
    serviceId: string;
    rating: number;
    comment: string;
    createdAt: string;
    users: null | any; 
}

export interface Service {
    serviceId: string;    
    shopId: string;
    tagId: string;
    serviceName: string;
    pricePerPerson: number;
    description: string;
    serviceImageUrl: string | string[] | null | undefined;
    createdAt: string;
    shop: Shop;
    bookings: any[];
    serviceTags: null | any;
    serviceReviews: ServiceReview[];
}

export interface ServiceTag {
    serviceTagId: string;
    tagName: string;
}