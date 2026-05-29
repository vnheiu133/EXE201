import type { Service, ServiceTag } from "@/types/feature";

export async function getListServices(): Promise<{ services: Service[]; tags: ServiceTag[] }> {
    try {
        const [serviceRes, tagRes] = await Promise.all([
            fetch("http://localhost:5278/api/service/list-services", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }),
            fetch("http://localhost:5278/api/filter/service-tags", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }),
        ]);

        if (!serviceRes.ok) throw new Error("Failed to fetch services");
        if (!tagRes.ok) throw new Error("Failed to fetch tags");

        const serviceResult = await serviceRes.json();
        const tagResult = await tagRes.json();

        const services = serviceResult.data.map((item: any) => ({
            ...item,
            serviceImageUrl: Array.isArray(item.serviceImageUrl) ? item.serviceImageUrl : [item.serviceImageUrl || "/placeholder.svg"],
            serviceTags: item.serviceTags || null,
        })) as Service[];

        const tags = tagResult.data || [];

        return { services, tags };
    } catch (err) {
        throw err;
    }
}

export async function getServicesByShopId(shopId: string): Promise<Service[]> {
    const response = await fetch(`http://localhost:5278/api/service/shop/${shopId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch shop services");

    const result = await response.json();
    const items = result.data || [];

    return items.map((item: any) => ({
        ...item,
        serviceImageUrl: Array.isArray(item.serviceImageUrl) ? item.serviceImageUrl : [item.serviceImageUrl || "/placeholder.svg"],
        serviceTags: item.serviceTags || null,
        serviceReviews: item.serviceReviews || [],
    })) as Service[];
}
