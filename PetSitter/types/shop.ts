import { Product } from "./product";

export interface Shop {
    shopId: string;
    userId: string;
    shopName: string;
    description: string;
    address: string;
    location: string;
    shopImageUrl: string;
    products: Product[];
    services: any[];
}
