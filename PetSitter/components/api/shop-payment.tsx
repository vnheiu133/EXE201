import type { ShopOrder } from "@/types/shop-payment";

export async function getAllOrders(): Promise<ShopOrder[]> {
    const res = await fetch(`/api/orders/getallorders`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Không tải được danh sách đơn hàng");

    const result = await res.json();

    return result;
}
