// components/api/product.ts
import type { Product } from "@/types/product";
import { Review } from "@/types/review";

function safeImage(url: any) {
    if (!url) return "/placeholder.png";
    if (typeof url === "string" && url.toLowerCase() === "null") return "/placeholder.png";
    return url;
}

export async function listProducts(): Promise<Product[]> {
    const res = await fetch("/api/product/list-products", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Không tải được danh sách sản phẩm");
    }

    const result = await res.json();
    const items = result?.data ?? [];

    return items.map((item: any): Product => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        productImageUrl: safeImage(item.productImageUrl),
        categoryName: item.categoryName ?? "",
        brandName: item.brandName ?? "",
        tags: item.tags ?? [],
        description: item.description ?? "",
        availabilityStatus: item.availabilityStatus ?? false,
        rating: item.rating ?? 0,
        stockQuantity: item.stockQuantity ?? 0,
        shopId: item.shopId ?? "",
        shopName: item.shopName ?? "",
        shopImageUrl: item.shopImageUrl ?? "",
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        reviews: []
    }));
}

export async function getProductById(id: string): Promise<Product> {
    const res = await fetch(`/api/product/product/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Không tải được sản phẩm");

    const result = await res.json();
    const item = result.data;

    return {
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        productImageUrl: safeImage(item.productImageUrl),
        categoryName: item.category?.categoryName ?? "",
        brandName: item.brand?.brandName ?? "",
        tags: Array.isArray(item.tags)
        ? item.tags.map((t: any) => t.productTagName)
        : item.tags
            ? [item.tags.productTagName]
            : [],
        description: item.description,
        availabilityStatus: item.availabilityStatus,
        rating: item.rating,
        shopId: item.shopId ?? "",
        shopName: item.shop?.shopName ?? "",
        shopImageUrl: item.shop?.shopImageUrl ?? "",
        reviews: item.reviews ?? [],
    };
}

export async function getRelatedProduct(id: string): Promise<Product[]> {
    const res = await fetch(`/api/product/related-products/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Không tìm thấy sản phẩm tương tự");

    const result = await res.json();
    const items = result.data ?? [];

    return items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        productImageUrl: safeImage(item.productImageUrl),
        categoryName: item.category?.categoryName ?? "",
        brandName: item.brand?.brandName ?? "",
        tags: Array.isArray(item.tags)
        ? item.tags.map((t: any) => t.productTagName)
        : item.tags
            ? [item.tags.productTagName]
            : [],
        description: item.description,
        availabilityStatus: item.availabilityStatus,
        rating: item.rating,
        shopId: item.shopId ?? "",
        shopName: item.shop?.shopName ?? "",
        shopImageUrl: item.shop?.shopImageUrl ?? "",
        reviews: item.reviews ?? [],
    }));
}

export async function productReview(productId: string): Promise<Review[]> {
    const res = await fetch(`/api/product/reviews/${productId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })

    if (!res.ok) throw new Error("Không tìm thấy đánh giá")
    const result = await res.json()
    const items = result.data ?? []

    return items.map((item: any): Review => ({
        reviewId: item.reviewId,
        userId: item.userId,
        productId: item.productId,
        rating: item.rating,
        comment: item.comment,
        createdAt: item.createdAt,
        users: {
        userId: item.users.userId,
        fullName: item.users.fullName,
        profilePictureUrl: item.users.profilePictureUrl,
        }
    }))
}

export async function writeProductReview(review: {
    userId: string
    productId: string
    context: string
    rating: number
}) {
    const res = await fetch("/api/product/write-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
    })

    if (!res.ok) throw new Error("Không gửi được đánh giá")
    return res.json()
}
