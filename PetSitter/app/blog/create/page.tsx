"use client";

import { useEffect, useState } from "react";
import { CreateBlogModal } from "@/components/blog/create-blog-modal";
import { getBlogTags, getBlogCategories } from "@/components/api/blog";
import type { BlogTag } from "@/types/blog";

interface Category {
    categoryId: string;
    categoryName: string;
}

export default function CreateBlogPage() {
    const [tags, setTags] = useState<BlogTag[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [open, setOpen] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tagData, categoryData] = await Promise.all([
                    getBlogTags(),
                    getBlogCategories(),
                ]);
                setTags(tagData);
                setCategories(categoryData);
            } catch (err) {
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <CreateBlogModal
                open={open}
                onClose={() => setOpen(false)}
                tags={tags}
                categories={categories}
                onCreated={() => {
                }}
            />
        </div>
    );
}
