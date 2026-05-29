"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { addProduct, updateProduct } from "@/components/api/shop";
import { Product } from "@/types/product";

interface ProductFormProps {
  editing: Product | null;
  setEditing: (p: Product | null) => void;
  shopId: string;
  tags: { productTagId: string; productTagName: string }[];
  brands: { brandId: string; brandName: string }[];
  categories: { categoryId: string; categoryName: string }[];
  onSuccess: (p: Product) => void;
}

export default function ProductForm({
  editing,
  setEditing,
  shopId,
  tags,
  brands,
  categories,
  onSuccess,
}: ProductFormProps) {
  const [form, setForm] = useState({
    shopId: shopId,
    productName: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    categoryId: "",
    brandId: "",
    tagId: "",
    imageUrl: null as File | null,
  });

  useEffect(() => {
    if (editing) {
      setForm({
        shopId,
        productName: editing.productName,
        description: editing.description,
        price: editing.price,
        stockQuantity: editing.stockQuantity || 0,
        categoryId: editing.categoryId || "",
        brandId: editing.brandId || "",
        tagId: editing.tagId || "",
        imageUrl: null,
      });
    } else {
      setForm({
        shopId,
        productName: "",
        description: "",
        price: 0,
        stockQuantity: 0,
        categoryId: "",
        brandId: "",
        tagId: "",
        imageUrl: null,
      });
    }
  }, [editing, shopId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "price" || name === "stockQuantity" ? Number(value) : value }));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("ShopId", form.shopId);
    formData.append("ProductName", form.productName);
    formData.append("Description", form.description);
    formData.append("Price", form.price.toString());
    formData.append("StockQuantity", form.stockQuantity.toString());
    formData.append("CategoryId", form.categoryId);
    formData.append("BrandId", form.brandId);
    formData.append("TagId", form.tagId);
    if (form.imageUrl) formData.append("ImageUrl", form.imageUrl);

    const res = editing
      ? await updateProduct(form.shopId, editing.productId, formData)
      : await addProduct(form.shopId, formData);

    if (res.success && res.data) {
      toast.success(`Product ${editing ? "updated" : "added"} successfully!`);
      onSuccess(res.data);
      setEditing(null);
    } else {
      toast.error(res.message || "Failed to save product");
    }
  };

  return (
    <div className="space-y-4">
      <Input name="productName" placeholder="Product name" value={form.productName} onChange={handleChange} />
      <Textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      <Input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} />
      <Input name="stockQuantity" type="number" placeholder="Stock" value={form.stockQuantity} onChange={handleChange} />

      <Select value={form.categoryId} onValueChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}>
        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.categoryId} value={c.categoryId}>
              {c.categoryName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={form.brandId} onValueChange={(v) => setForm((p) => ({ ...p, brandId: v }))}>
        <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
        <SelectContent>
          {brands.map((b) => (
            <SelectItem key={b.brandId} value={b.brandId}>
              {b.brandName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={form.tagId} onValueChange={(v) => setForm((p) => ({ ...p, tagId: v }))}>
        <SelectTrigger><SelectValue placeholder="Select tag" /></SelectTrigger>
        <SelectContent>
          {tags.map((t) => (
            <SelectItem key={t.productTagId} value={t.productTagId}>
              {t.productTagName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        name="imageUrl"
        type="file"
        accept="image/*"
        onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.files?.[0] || null }))}
      />

      <Button className="w-full mt-2" onClick={handleSubmit}>
        {editing ? "Update" : "Add Product"}
      </Button>
    </div>
  );
}
