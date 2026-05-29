import type { ShopOrder } from "@/types/shop-payment";

export async function getAllOrders(): Promise<ShopOrder[]> {
    const res = await fetch(`http://localhost:5278/api/orders/getallorders`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Getting product failed");

    const result = await res.json();

    return result;
}
