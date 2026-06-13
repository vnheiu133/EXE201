import type { Service, ServiceTag } from "@/types/feature";
import { normalizeImageUrl } from "@/lib/image-url";

export async function getListServices(): Promise<{ services: Service[]; tags: ServiceTag[] }> {
    try {
        const [serviceRes, tagRes] = await Promise.all([
            fetch("/api/service/list-services", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }),
            fetch("/api/filter/service-tags", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }),
        ]);

        if (!serviceRes.ok) throw new Error("Không tải được dịch vụ");
        if (!tagRes.ok) throw new Error("Không tải được thẻ");

        const serviceResult = await serviceRes.json();
        const tagResult = await tagRes.json();

        const services = serviceResult.data.map((item: any) => ({
            ...item,
            serviceImageUrl: normalizeImageUrl(item.serviceImageUrl),
            serviceTags: item.serviceTags || null,
        })) as Service[];

        const tags = tagResult.data || [];

        return { services, tags };
    } catch (err) {
        throw err;
    }
}

export async function getServicesByShopId(shopId: string): Promise<Service[]> {
    const response = await fetch(`/api/service/shop/${shopId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Không tải được dịch vụ của cửa hàng");

    const result = await response.json();
    const items = result.data || [];

    return items.map((item: any) => ({
        ...item,
        serviceImageUrl: normalizeImageUrl(item.serviceImageUrl),
        serviceTags: item.serviceTags || null,
        serviceReviews: item.serviceReviews || [],
    })) as Service[];
}
