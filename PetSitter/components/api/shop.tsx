import { Product } from "@/types/product";
import { ApiResponse } from "./response";

export const getShopByUserId = async (
    userId: string
): Promise<ApiResponse<any>> => {
    try {
        const response = await fetch(
            `/api/shop/${userId}/shop`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response.ok) {
            throw new Error("Không tải được dữ liệu cửa hàng");
        }
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: "Không tải được dữ liệu cửa hàng",
            data: null,
        };
    }
};

export const getProductsByShopId = async (shopId: string): Promise<ApiResponse<Product[]>> => {
    try {
        const response = await fetch(`/api/shop/${shopId}/products`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error("Không tải được danh sách sản phẩm");
        }
        const result = await response.json();
        const shop = result.data;
        const products = Array.isArray(shop?.products) ? shop.products : [];

        if (result.success) {
            return {
                success: true,
                message: result.message,
                data: products.map((p: any) => ({
                    productId: p.productId,
                    productName: p.productName,
                    price: p.price,
                    productImageUrl: p.productImageUrl || "/placeholder.png",
                    categoryName: p.category?.categoryName || "",
                    brandName: p.brand?.brandName || "",
                    tags: p.tags ? [p.tags.productTagName] : [],
                    description: p.description || "",
                    availabilityStatus: p.stockQuantity > 0,
                    rating: 0,
                    reviews: [],
                    categoryId: p.categoryId,
                    brandId: p.brandId,
                    stockQuantity: p.stockQuantity,
                    shopId: p.shopId,
                    shopName: shop?.shopName || "",
                    shopImageUrl: shop?.shopImageUrl || "",
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                })),
            };
        }
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Không tải được danh sách sản phẩm",
            data: null,
        };
    }
};


export const getProductCountByShopId = async (
    shopId: string
): Promise<ApiResponse<number>> => {
    try {
        const response = await fetch(
            `/api/shop/${shopId}/products/count`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response.ok) {
            throw new Error("Không tải được số lượng sản phẩm");
        }
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: "Không tải được số lượng sản phẩm",
            data: 0,
        };
    }
};

export const getOrderCountByShopId = async (
    shopId: string
): Promise<ApiResponse<number>> => {
    try {
        const response = await fetch(
            `/api/shop/${shopId}/orders/count`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response.ok) {
            throw new Error("Không tải được số lượng đơn hàng");
        }
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: "Không tải được số lượng đơn hàng",
            data: 0,
        };
    }
};

export const addProduct = async (
    shopId: string,
    product: FormData
): Promise<ApiResponse<Product>> => {
    try {
        const response = await fetch(
            `/api/shop/${shopId}/products`,
            {
                method: "POST",
                body: product,
            }
        );
        if (!response.ok) {
            throw new Error("Thêm sản phẩm thất bại");
        }
        const result = await response.json();
        if (result.success && result.data) {
            return {
                success: true,
                message: result.message,
                data: {
                    productId: result.data.productId,
                    productName: result.data.productName,
                    price: result.data.price,
                    productImageUrl: result.data.productImageUrl,
                    categoryName: result.data.category?.categoryName || "Chưa có",
                    brandName: result.data.brand?.brandName || "Chưa có",
                    tags: result.data.tags || [],
                    description: result.data.description || "",
                    availabilityStatus: result.data.stockQuantity > 0,
                    rating: 0,
                    reviews: [],
                    categoryId: result.data.categoryId,
                    brandId: result.data.brandId,
                    stockQuantity: result.data.stockQuantity,
                    shopId: result.data.shopId,
                    createdAt: result.data.createdAt,
                    updatedAt: result.data.updatedAt,
                },
            };
        }
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Thêm sản phẩm thất bại",
            data: null,
        };
    }
};

export const updateProduct = async (
    shopId: string,
    productId: string,
    product: FormData
): Promise<ApiResponse<Product>> => {
    try {
        const response = await fetch(
            `/api/shop/${shopId}/products/${productId}`,
            {
                method: "PUT",
                body: product,
            }
        );
        if (!response.ok) {
            throw new Error("Cập nhật sản phẩm thất bại");
        }
        const result = await response.json();
        if (result.success && result.data) {
            return {
                success: true,
                message: result.message,
                data: {
                    productId: result.data.productId,
                    productName: result.data.productName,
                    price: result.data.price,
                    productImageUrl: result.data.productImageUrl,
                    categoryName: result.data.category?.categoryName || "Chưa có",
                    brandName: result.data.brand?.brandName || "Chưa có",
                    tags: result.data.tags || [],
                    description: result.data.description || "",
                    availabilityStatus: result.data.stockQuantity > 0,
                    rating: 0,
                    reviews: [],
                    categoryId: result.data.categoryId,
                    brandId: result.data.brandId,
                    stockQuantity: result.data.stockQuantity,
                    shopId: result.data.shopId,
                    createdAt: result.data.createdAt,
                    updatedAt: result.data.updatedAt,
                },
            };
        }
        return result;
    } catch (error) {
        return {
            success: false,
            message: "Cập nhật sản phẩm thất bại",
            data: null,
        };
    }
};

// Fetch product tags
export const getProductTags = async (): Promise<ApiResponse<any[]>> => {
    try {
        const response = await fetch(
            `/api/filter/product-tags`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "*/*",
                },
            }
        );
        if (!response.ok) {
            throw new Error("Không tải được thẻ sản phẩm");
        }
        const result = await response.json();
        return {
            success: result.success,
            message: result.message,
            data: result.data || [],
        };
    } catch (error) {
        return {
            success: false,
            message: "Không tải được thẻ sản phẩm",
            data: [],
        };
    }
};

// Fetch product brands
export const getProductBrands = async (): Promise<ApiResponse<any[]>> => {
    try {
        const response = await fetch(
            `/api/filter/product-brands`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "*/*",
                },
            }
        );
        if (!response.ok) {
            throw new Error("Không tải được thương hiệu sản phẩm");
        }
        const result = await response.json();
        return {
            success: result.success,
            message: result.message,
            data: result.data || [],
        };
    } catch (error) {
        return {
            success: false,
            message: "Không tải được thương hiệu sản phẩm",
            data: [],
        };
    }
};

// Fetch product categories
export const getProductCategories = async (): Promise<ApiResponse<any[]>> => {
    try {
        const response = await fetch(
            `/api/filter/product-categories`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "*/*",
                },
            }
        );
        if (!response.ok) {
            throw new Error("Không tải được danh mục sản phẩm");
        }
        const result = await response.json();
        return {
            success: result.success,
            message: result.message,
            data: result.data || [],
        };
    } catch (error) {
        return {
            success: false,
            message: "Không tải được danh mục sản phẩm",
            data: [],
        };
    }
};

const API_BASE = "/api/shop";

export async function getShopRevenue(shopId: string) {
    const res = await fetch(`${API_BASE}/${shopId}/orders/revenue`, {
        credentials: "include",
    });
    return res.json();
}

export async function getTotalSoldProducts(shopId: string) {
    const res = await fetch(`${API_BASE}/${shopId}/products/total-sold`, {
        credentials: "include",
    });
    return res.json();
}

export async function updateShopImage(shopId: string, shopImageUrl: string): Promise<ApiResponse<any>> {
    const res = await fetch(`${API_BASE}/${shopId}/image`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ shopImageUrl }),
    });

    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.message || "Cập nhật ảnh cửa hàng thất bại");
    }

    return result;
}

export async function uploadShopImage(shopId: string, file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/${shopId}/image/upload`, {
        method: "POST",
        body: formData,
    });

    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.message || "Tải ảnh cửa hàng thất bại");
    }

    return result;
}
