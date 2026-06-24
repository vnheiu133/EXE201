import type { Blog, BlogTag, BlogDetailDTO } from "@/types/blog";
import { ApiResponse } from "./response";

const FALLBACK_BLOG_DATE = "2024-04-01T00:00:00.000Z";

function normalizeBlogDetail(data: any): BlogDetailDTO {
  const author = data?.author || data?.users || {};
  const tag = data?.blogTag || {};

  return {
    blogId: data?.blogId || "",
    title: data?.title || "Bài viết PetSitter",
    content: data?.content || data?.description || data?.summary || "",
    tagName: data?.tagName || tag?.blogTagName || data?.categoryId || "Chăm sóc thú cưng",
    readTimeMinutes: data?.readTimeMinutes || 3,
    viewCount: data?.viewCount || 0,
    likeCount: data?.likeCount || 0,
    hasUserLiked: Boolean(data?.hasUserLiked),
    createdAt: data?.createdAt || FALLBACK_BLOG_DATE,
    authorId: data?.authorId || author?.userId || "",
    authorName: data?.authorName || author?.fullName || "PetSitter Team",
    authorAvatar: data?.authorAvatar || author?.profilePictureUrl || "/placeholder-user.jpg",
    authorExperience: data?.authorExperience || author?.shop?.description || "Chia sẻ kinh nghiệm chăm sóc thú cưng",
    featuredImageUrl: data?.featuredImageUrl || "/placeholder.svg",
  };
}

function normalizeBlog(data: any): Blog {
  const detail = normalizeBlogDetail(data);
  const tag = data?.blogTag || {};

  return {
    blogId: detail.blogId,
    authorId: detail.authorId,
    tagId: data?.tagId || tag?.blogTagId || "",
    categoryId: data?.categoryId || "",
    title: detail.title,
    content: detail.content,
    readTimeMinutes: detail.readTimeMinutes,
    viewCount: detail.viewCount,
    likeCount: detail.likeCount,
    createdAt: detail.createdAt,
    updatedAt: data?.updatedAt || detail.createdAt,
    author: data?.author || {
      userId: detail.authorId,
      fullName: detail.authorName,
      profilePictureUrl: detail.authorAvatar,
      role: 0,
      dateOfBirth: "",
      address: "",
      email: "",
      phoneNumber: "",
      passwordHash: "",
      createdAt: "",
      updatedAt: "",
      shop: null,
      blogs: [],
      reviews: [],
      serviceReviews: [],
      orders: [],
      pets: [],
      bookings: [],
      blogLikes: [],
    },
    blogTag: {
      blogTagId: tag?.blogTagId || data?.tagId || "",
      blogTagName: detail.tagName,
      blogs: [],
    },
    categories: data?.categories || null,
    blogLikes: data?.blogLikes || [],
    featuredImageUrl: detail.featuredImageUrl,
  };
}

/**
 * Helper: lấy user từ localStorage
 */
function getCurrentUser() {
  if (typeof window === "undefined") return null; // tránh lỗi khi SSR
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export async function getAllBlogs(): Promise<Blog[]> {
  try {
    const res = await fetch("/api/blog/getallblogs", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) return [];

    const result = await res.json();
    const items = Array.isArray(result?.data) ? result.data : [];
    return items.map(normalizeBlog);
  } catch {
    return [];
  }
}

export async function getBlogTags(): Promise<BlogTag[]> {
  try {
    const res = await fetch("/api/filter/blog-tags", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) return [];

    const result = await res.json();
    return Array.isArray(result?.data) ? result.data : [];
  } catch {
    return [];
  }
}

export async function getBlogById(blogId: string): Promise<BlogDetailDTO> {
  const user = getCurrentUser();
  const userId = user?.userId ?? "00000000-0000-0000-0000-000000000000";

  const res = await fetch(
    `/api/blog/getblogbyid/${blogId}?userId=${userId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) {
    throw new Error("Không tải được chi tiết bài viết");
  }

  const result = await res.json();
  return result.data;
}

export async function increaseView(blogId: string): Promise<Blog> {
  const res = await fetch(`/api/blog/increaseview/${blogId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Không tăng được lượt xem: ${errorText}`);
  }

  const result = await res.json();
  return result.data;
}

export async function toggleLike(blogId: string): Promise<{ likeCount: number; hasLiked: boolean }> {
  const user = getCurrentUser();
  if (!user) throw new Error("Không tìm thấy người dùng trong bộ nhớ trình duyệt");

  const res = await fetch(
    `/api/blog/togglelike/${blogId}?userId=${user.userId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) {
    throw new Error("Không cập nhật được lượt thích");
  }

  const result = await res.json();
  return result.data;
}

export async function hasUserLiked(blogId: string): Promise<boolean> {
  const user = getCurrentUser();
  if (!user) return false;

  const res = await fetch(
    `/api/blog/hasuserliked/${blogId}?userId=${user.userId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) {
    throw new Error("Không kiểm tra được trạng thái yêu thích");
  }

  const result = await res.json();
  return result.data;
}

export async function createBlog(authorId: string, formData: FormData) {
  const res = await fetch(`/api/blog/${authorId}/create`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Tạo bài viết thất bại");
  return await res.json();
}

export async function getBlogCategories(): Promise<{ categoryId: string; categoryName: string }[]> {
  const res = await fetch("/api/filter/blog-categories", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Không tải được danh mục bài viết");
  }

  const result = await res.json();
  return result.data;
}

