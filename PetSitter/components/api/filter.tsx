export async function getProductCategories() {
    const res = await fetch("http://localhost:5278/api/filter/product-categories", {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    const result = await res.json();
    return result.data;
}

export async function getProductBrands() {
    const res = await fetch("http://localhost:5278/api/filter/product-brands", {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch brands");
    const result = await res.json();
    return result.data;
}

export async function getProductTags() {
    const res = await fetch("http://localhost:5278/api/filter/product-tags", {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch tags");
    const result = await res.json();
    return result.data;
}

