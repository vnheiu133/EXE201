"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/navigation";
import { PageHero } from "@/components/page-hero";
import { Footer } from "@/components/footer";
import { Search, Mail, ArrowRight } from "lucide-react";
import { getAllBlogs, getBlogTags } from "@/components/api/blog";
import type { Blog, BlogFilters, BlogTag } from "@/types/blog";

// ==================== MOCK DATA FOR FALLBACK ====================
const MOCK_DATE = "2024-04-01T00:00:00.000Z";

const MOCK_AUTHOR = {
  userId: "author-1",
  fullName: "Đội ngũ PetSitter",
  profilePictureUrl: "/placeholder-user.jpg",
  role: 1,
  dateOfBirth: "",
  address: "",
  email: "contact@petsitter.com",
  phoneNumber: "",
  passwordHash: "",
  createdAt: MOCK_DATE,
  updatedAt: MOCK_DATE,
  shop: null,
  blogs: [],
  reviews: [],
  serviceReviews: [],
  orders: [],
  pets: [],
  bookings: [],
  blogLikes: [],
};

const MOCK_TAGS: BlogTag[] = [
  { blogTagId: "nutrition", blogTagName: "Dinh dưỡng", blogs: [] },
  { blogTagId: "health", blogTagName: "Sức khỏe", blogs: [] },
  { blogTagId: "training", blogTagName: "Huấn luyện", blogs: [] },
  { blogTagId: "lifestyle", blogTagName: "Lối sống", blogs: [] },
];

const MOCK_BLOGS: Blog[] = [
  {
    blogId: "1",
    authorId: "author-1",
    tagId: "training",
    categoryId: "Huấn luyện",
    title: "10 lời khuyên cho người mới nuôi chó lần đầu",
    content: "Đón chú cún đầu tiên về nhà là một trải nghiệm kỳ diệu nhưng cũng đầy thách thức. Hãy tìm hiểu các kiến thức cơ bản về xã hội hóa, huấn luyện đi vệ sinh và vâng lời cơ bản để tạo bước đệm thành công cho cún cưng.",
    readTimeMinutes: 5,
    viewCount: 120,
    likeCount: 45,
    createdAt: "2024-04-12T10:00:00Z",
    updatedAt: "2024-04-12T10:00:00Z",
    author: MOCK_AUTHOR,
    blogTag: { blogTagId: "training", blogTagName: "Huấn luyện", blogs: [] },
    categories: null,
    blogLikes: [],
    featuredImageUrl: "/puppy-training.png",
  },
  {
    blogId: "2",
    authorId: "author-1",
    tagId: "nutrition",
    categoryId: "Dinh dưỡng",
    title: "Chế độ ăn tốt nhất cho mèo nuôi trong nhà",
    content: "Mèo nuôi trong nhà có nhu cầu calo đặc thù so với mèo thả rông. Chúng tôi sẽ phân tích các thành phần dinh dưỡng tốt nhất cho bộ lông khỏe mạnh, quản lý cân nặng và sức khỏe tiêu hóa.",
    readTimeMinutes: 4,
    viewCount: 95,
    likeCount: 32,
    createdAt: "2024-04-08T09:00:00Z",
    updatedAt: "2024-04-08T09:00:00Z",
    author: MOCK_AUTHOR,
    blogTag: { blogTagId: "nutrition", blogTagName: "Dinh dưỡng", blogs: [] },
    categories: null,
    blogLikes: [],
    featuredImageUrl: "/happy-indoor-cat.png",
  },
  {
    blogId: "3",
    authorId: "author-1",
    tagId: "stories",
    categoryId: "Câu chuyện",
    title: "Hành trình tìm lại mái ấm của chú chó 'Charlie'",
    content: "Trong bài viết nổi bật về cộng đồng lần này, hãy đọc về hành trình kỳ diệu của một chú chó cứu hộ đã thay đổi cả một khu phố...",
    readTimeMinutes: 6,
    viewCount: 210,
    likeCount: 88,
    createdAt: "2024-04-05T08:00:00Z",
    updatedAt: "2024-04-05T08:00:00Z",
    author: MOCK_AUTHOR,
    blogTag: { blogTagId: "stories", blogTagName: "Câu chuyện", blogs: [] },
    categories: null,
    blogLikes: [],
    featuredImageUrl: "/happy-person-dog.png",
  },
  {
    blogId: "4",
    authorId: "author-1",
    tagId: "health",
    categoryId: "Sức khỏe",
    title: "An toàn mùa xuân: Hướng dẫn dành cho chủ nuôi",
    content: "Khi giao mùa, những mối nguy mới cho thú cưng bắt đầu xuất hiện. Từ dị ứng thời tiết đến phòng ngừa ve rận, đây là những gì bạn cần biết để giữ cho thú cưng luôn an toàn trong mùa xuân này.",
    readTimeMinutes: 5,
    viewCount: 150,
    likeCount: 52,
    createdAt: "2024-04-02T07:00:00Z",
    updatedAt: "2024-04-02T07:00:00Z",
    author: MOCK_AUTHOR,
    blogTag: { blogTagId: "health", blogTagName: "Sức khỏe", blogs: [] },
    categories: null,
    blogLikes: [],
    featuredImageUrl: "/veterinarian-examining-pet.png",
  },
];

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [filters, setFilters] = useState<BlogFilters>({
    category: "Tất cả",
    searchQuery: "",
    tagId: null,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [blogData, tagData] = await Promise.all([getAllBlogs(), getBlogTags()]);
        setBlogs(blogData && blogData.length > 0 ? blogData : MOCK_BLOGS);
        setTags(tagData && tagData.length > 0 ? tagData : MOCK_TAGS);
      } catch (err) {
        console.warn("Không tải được dữ liệu bài viết, đang dùng dữ liệu mẫu:", err);
        setBlogs(MOCK_BLOGS);
        setTags(MOCK_TAGS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPosts = useMemo(() => {
    return blogs.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        post.blogTag.blogTagName.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const matchesTag = !filters.tagId || post.tagId === filters.tagId;
      return matchesSearch && matchesTag;
    });
  }, [blogs, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage));
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const handlePageChange = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
    window.scrollTo({ top: 520, behavior: "smooth" });
  };

  const recentPostsList = useMemo(() => {
    const source = blogs.length > 0 ? blogs : MOCK_BLOGS;
    return [...source]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [blogs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <PageHero
          eyebrow="Tạp chí PetSitter"
          title="Câu chuyện, hướng dẫn và mẹo chăm sóc thú cưng"
          description="Đọc các lời khuyên về dịch vụ, ghi chú sản phẩm và ý tưởng chăm sóc thú cưng hàng ngày từ cộng đồng chuyên gia và chủ nuôi của PetSitter."
          imageSrc="/happy-dog-park-run.png"
          imageAlt="Chú chó Golden Retriever vui vẻ chạy nhảy"
        />
        <div className="container mx-auto flex min-h-96 items-center justify-center px-4 text-[#687d76] font-medium">
          Đang tải bài viết...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navigation />

      <PageHero
        eyebrow="Tạp chí PetSitter"
        title="Câu chuyện, hướng dẫn và mẹo chăm sóc thú cưng"
        description="Đọc các lời khuyên về dịch vụ, ghi chú sản phẩm và ý tưởng chăm sóc thú cưng hàng ngày từ cộng đồng chuyên gia và chủ nuôi của PetSitter."
        imageSrc="/happy-dog-park-run.png"
        imageAlt="Chú chó Golden Retriever vui vẻ chạy nhảy"
      >
        <div className="flex flex-wrap gap-4">
          <Link href="/blog/create">
            <button className="h-11 px-6 font-semibold bg-[#a23820] text-white rounded-md hover:bg-[#8e2e1a] transition-all duration-200 hover:scale-[1.02] shadow-md cursor-pointer">
              Tạo bài viết
            </button>
          </Link>
          <button className="h-11 px-6 font-semibold border border-white/50 bg-white/10 text-white rounded-md backdrop-blur-sm hover:bg-white hover:text-[#16312a] hover:border-white transition-all duration-200 cursor-pointer">
            Đăng ký nhận tin
          </button>
        </div>
      </PageHero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          <div className="lg:col-span-3">
            <BlogFilters filters={filters} setFilters={setFilters} tags={tags} />
            
            <BlogList
              posts={paginatedPosts}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>

          <div className="space-y-10">
            <RecentPosts posts={recentPostsList} />
            <SubscribeCard />
            <PopularTags onTagClick={(tag) => setFilters({ ...filters, searchQuery: tag })} />
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}



function BlogFilters({
  filters,
  setFilters,
  tags,
}: {
  filters: BlogFilters;
  setFilters: (f: BlogFilters) => void;
  tags: BlogTag[];
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
        <input
          type="text"
          placeholder="Tìm kiếm bài viết (chỉ nội dung)..."
          value={filters.searchQuery}
          onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
          className="w-full pl-11 pr-4 py-2.5 bg-[#f0f0f0] border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a23820]/20 text-sm text-gray-800 placeholder-gray-500 transition-all font-medium"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilters({ ...filters, tagId: null })}
          className={`px-5 py-2 text-sm font-medium rounded-full transition-all cursor-pointer ${
            filters.tagId === null
              ? "bg-[#a23820] text-white shadow-sm"
              : "bg-[#eaeaea] text-gray-700 hover:bg-[#dfdfdf]"
          }`}
        >
          Tất cả
        </button>
        {tags.map((tag) => (
          <button
            key={tag.blogTagId}
            onClick={() => setFilters({ ...filters, tagId: tag.blogTagId })}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-all cursor-pointer ${
              filters.tagId === tag.blogTagId
                ? "bg-[#a23820] text-white shadow-sm"
                : "bg-[#eaeaea] text-gray-700 hover:bg-[#dfdfdf]"
            }`}
          >
            {tag.blogTagName}
          </button>
        ))}
      </div>
    </div>
  );
}

function BlogList({
  posts,
  currentPage,
  totalPages,
  onPageChange,
}: {
  posts: Blog[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getTagColor = (tagName: string) => {
    switch (tagName.toLowerCase()) {
      case "training":
      case "huấn luyện":
        return "text-[#1d4ed8]";
      case "nutrition":
      case "dinh dưỡng":
        return "text-[#047857]";
      case "stories":
      case "câu chuyện":
        return "text-[#b45309]";
      case "health":
      case "sức khỏe":
        return "text-[#0f766e]";
      default:
        return "text-gray-600";
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-gray-500 text-lg font-medium">Không tìm thấy bài viết nào phù hợp với tiêu chí của bạn.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
        {posts.map((post) => (
          <article
            key={post.blogId}
            className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-50">
              <Image
                src={post.featuredImageUrl || "/placeholder.jpg"}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="mb-2.5">
                  <span className={`text-xs font-bold uppercase tracking-wider ${getTagColor(post.blogTag.blogTagName)}`}>
                    {post.blogTag.blogTagName}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug mb-3 hover:text-[#a23820] transition-colors duration-200 line-clamp-2 h-14 md:h-16">
                  <Link href={`/blog/${post.blogId}`}>
                    {post.title}
                  </Link>
                </h2>

                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
                  {post.content.replace(/<[^>]*>/g, "")}
                </p>
              </div>

              <div className="mt-auto">
                <Link
                  href={`/blog/${post.blogId}`}
                  className="text-[#a23820] hover:text-[#8e2e1a] text-sm font-semibold inline-flex items-center gap-1.5 transition-colors duration-200 group/link"
                >
                  Đọc thêm
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-16">
          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            const isActive = currentPage === page;

            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-12 w-12 items-center justify-center rounded-md border text-base font-semibold shadow-sm transition-all ${
                  isActive
                    ? "border-[#a23820] bg-[#a23820] text-white"
                    : "border-gray-200 bg-white text-[#16312a] hover:border-[#a23820] hover:text-[#a23820]"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RecentPosts({ posts }: { posts: Blog[] }) {
  const getStaticDate = (idx: number) => {
    const dates = ["12 Tháng 4, 2024", "08 Tháng 4, 2024", "02 Tháng 4, 2024"];
    return dates[idx] || "01 Tháng 4, 2024";
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Bài viết gần đây</h3>

      <div className="flex flex-col">
        {posts.map((post, idx) => (
          <div
            key={post.blogId}
            className="py-4 border-b border-gray-100 last:border-b-0 last:pb-0 first:pt-0"
          >
            <span className="text-xs text-gray-400 block mb-1 font-medium">
              {getStaticDate(idx)}
            </span>
            <Link
              href={`/blog/${post.blogId}`}
              className="text-sm font-semibold text-gray-800 hover:text-[#a23820] transition-colors duration-200 leading-snug line-clamp-2"
            >
              {post.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscribeCard() {
  return (
    <div className="bg-[#cbebe0] rounded-2xl p-8 flex flex-col items-start border border-[#b8e2d4] shadow-sm">
      <Mail className="w-8 h-8 text-[#2b5042] mb-4" />
      
      <h3 className="text-xl font-bold text-[#2b5042] mb-2">Cập nhật tin tức</h3>
      <p className="text-sm text-[#406859] mb-6 leading-relaxed font-medium">
        Nhận các mẹo và câu chuyện chăm sóc thú cưng mới nhất gửi đến hộp thư của bạn vào mỗi Thứ Ba hàng tuần.
      </p>
      
      <div className="w-full">
        <input
          type="email"
          placeholder="Nhập email của bạn"
          className="w-full px-4 py-2.5 rounded-md bg-white border-0 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b5042] mb-3 font-medium"
        />
        <button className="w-full py-2.5 font-semibold text-white bg-[#2b5042] rounded-md hover:bg-[#1f3b31] transition-colors duration-200 cursor-pointer text-center text-sm shadow-sm">
          Đăng ký
        </button>
      </div>
    </div>
  );
}

function PopularTags({ onTagClick }: { onTagClick: (tag: string) => void }) {
  const popularTagsList = [
    "Chăm sóc cún",
    "Nhận nuôi",
    "Hành vi",
    "Thú cưng lớn tuổi",
    "Sơ cứu",
  ];

  return (
    <div className="bg-[#f5f6f5] rounded-2xl p-8 border border-gray-100 shadow-sm">
      <h3 className="text-xs font-extrabold uppercase text-gray-500 tracking-wider mb-5">
        Thẻ phổ biến
      </h3>
      <div className="flex flex-wrap gap-2">
        {popularTagsList.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
