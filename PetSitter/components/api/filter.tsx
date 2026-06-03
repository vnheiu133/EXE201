export async function getProductCategories() {
    const res = await fetch("/api/filter/product-categories", {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Không tải được danh mục");
    const result = await res.json();
    return result.data;
}

export async function getProductBrands() {
    const res = await fetch("/api/filter/product-brands", {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Không tải được thương hiệu");
    const result = await res.json();
    return result.data;
}

export async function getProductTags() {
    const res = await fetch("/api/filter/product-tags", {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Không tải được thẻ");
    const result = await res.json();
    return result.data;
}

