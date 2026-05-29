"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Copy,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
} from "lucide-react";

import { getBlogById, hasUserLiked, increaseView, toggleLike } from "@/components/api/blog";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import type { BlogDetailDTO } from "@/types/blog";

const FALLBACK_POSTS: Record<string, BlogDetailDTO> = {
  "1": {
    blogId: "1",
    title: "10 lời khuyên cho người mới nuôi chó lần đầu",
    content:
      "<p>Đón một chú cún về nhà là trải nghiệm rất vui, nhưng những ngày đầu cần chuẩn bị kỹ. Hãy tạo một góc ngủ cố định, chuẩn bị bát ăn uống riêng, đồ chơi nhai an toàn và lịch đi vệ sinh đều đặn.</p><p>Trong tuần đầu, bạn nên cho cún làm quen với nhà mới bằng nhịp sinh hoạt nhẹ nhàng. Khen thưởng khi cún làm đúng, tránh la mắng quá nhiều, và bắt đầu luyện các lệnh cơ bản như ngồi, lại đây, chờ.</p><p>Đừng quên đặt lịch kiểm tra thú y, tiêm phòng và tư vấn khẩu phần ăn phù hợp với độ tuổi, cân nặng của cún.</p>",
    tagName: "Huấn luyện",
    readTimeMinutes: 5,
    viewCount: 120,
    likeCount: 45,
    hasUserLiked: false,
    createdAt: "2024-04-12T10:00:00Z",
    authorId: "author-1",
    authorName: "PetSitter Team",
    authorAvatar: "/placeholder-user.jpg",
    authorExperience: "Chia sẻ kinh nghiệm chăm sóc thú cưng",
    featuredImageUrl: "/puppy-training.png",
  },
  "2": {
    blogId: "2",
    title: "Chế độ ăn tốt nhất cho mèo nuôi trong nhà",
    content:
      "<p>Mèo nuôi trong nhà thường vận động ít hơn mèo thả rông, vì vậy khẩu phần cần cân bằng giữa protein, chất béo và lượng calo hằng ngày. Nên chọn thức ăn có nguồn đạm rõ ràng, đủ taurine và phù hợp với từng giai đoạn tuổi.</p><p>Bạn có thể chia nhỏ bữa ăn trong ngày để tránh ăn quá nhanh. Luôn chuẩn bị nước sạch, theo dõi cân nặng định kỳ và hạn chế cho ăn thức ăn của người vì dễ gây rối loạn tiêu hóa.</p>",
    tagName: "Dinh dưỡng",
    readTimeMinutes: 4,
    viewCount: 95,
    likeCount: 32,
    hasUserLiked: false,
    createdAt: "2024-04-08T09:00:00Z",
    authorId: "author-1",
    authorName: "PetSitter Team",
    authorAvatar: "/placeholder-user.jpg",
    authorExperience: "Chia sẻ kinh nghiệm chăm sóc thú cưng",
    featuredImageUrl: "/happy-indoor-cat.png",
  },
  "3": {
    blogId: "3",
    title: "Hành trình tìm lại mái ấm của chú chó Charlie",
    content:
      "<p>Charlie từng là một chú chó rất nhút nhát khi được đưa về trạm chăm sóc. Những ngày đầu, Charlie gần như chỉ nằm yên ở góc phòng và tránh tiếp xúc với người lạ.</p><p>Nhờ sự kiên nhẫn của tình nguyện viên, những buổi đi dạo ngắn và phần thưởng nhỏ sau mỗi lần tiến bộ, Charlie dần tự tin hơn. Câu chuyện của Charlie nhắc chúng ta rằng mỗi thú cưng đều cần thời gian, sự ổn định và một gia đình thật sự phù hợp.</p>",
    tagName: "Câu chuyện",
    readTimeMinutes: 6,
    viewCount: 210,
    likeCount: 88,
    hasUserLiked: false,
    createdAt: "2024-04-05T08:00:00Z",
    authorId: "author-1",
    authorName: "PetSitter Team",
    authorAvatar: "/placeholder-user.jpg",
    authorExperience: "Chia sẻ kinh nghiệm chăm sóc thú cưng",
    featuredImageUrl: "/happy-person-dog.png",
  },
  "4": {
    blogId: "4",
    title: "An toàn mùa xuân: Hướng dẫn dành cho chủ nuôi",
    content:
      "<p>Khi thời tiết thay đổi, thú cưng dễ gặp các vấn đề như dị ứng, ve rận, mất nước hoặc ăn phải cây cảnh không an toàn. Chủ nuôi nên kiểm tra lông sau khi đi dạo, vệ sinh ổ nằm thường xuyên và giữ lịch phòng ve rận đúng hẹn.</p><p>Nếu thú cưng hắt hơi kéo dài, gãi nhiều, bỏ ăn hoặc mệt bất thường, hãy liên hệ bác sĩ thú y để được kiểm tra sớm.</p>",
    tagName: "Sức khỏe",
    readTimeMinutes: 5,
    viewCount: 150,
    likeCount: 52,
    hasUserLiked: false,
    createdAt: "2024-04-02T07:00:00Z",
    authorId: "author-1",
    authorName: "PetSitter Team",
    authorAvatar: "/placeholder-user.jpg",
    authorExperience: "Chia sẻ kinh nghiệm chăm sóc thú cưng",
    featuredImageUrl: "/veterinarian-examining-pet.png",
  },
};

function withFallbackContent(blogId: string, post: BlogDetailDTO): BlogDetailDTO {
  const fallback = FALLBACK_POSTS[blogId];
  if (!fallback) return post;

  return {
    ...fallback,
    ...post,
    content: post.content?.trim() ? post.content : fallback.content,
    featuredImageUrl: post.featuredImageUrl || fallback.featuredImageUrl,
    authorAvatar: post.authorAvatar || fallback.authorAvatar,
    authorExperience: post.authorExperience || fallback.authorExperience,
  };
}

export default function BlogPostPage() {
  const params = useParams();
  const blogId = params.id as string;
  const [post, setPost] = useState<BlogDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [hasLikedState, setHasLikedState] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [copied, setCopied] = useState(false);

  const plainContent = useMemo(() => {
    if (!post?.content) return "";
    return post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }, [post?.content]);

  const articleSummary = useMemo(() => {
    if (!plainContent) return "Bài viết đang được cập nhật nội dung chi tiết.";
    return plainContent.length > 180 ? `${plainContent.slice(0, 180).trim()}...` : plainContent;
  }, [plainContent]);

  const articleWordCount = useMemo(() => {
    if (!plainContent) return 0;
    return plainContent.split(/\s+/).filter(Boolean).length;
  }, [plainContent]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fallback = FALLBACK_POSTS[blogId];
        const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(blogId);

        if (!isGuid && fallback) {
          setPost(fallback);
          setHasLikedState(Boolean(fallback.hasUserLiked));
          return;
        }

        increaseView(blogId).catch(() => undefined);
        const data = await getBlogById(blogId);
        const nextPost = fallback ? withFallbackContent(blogId, data) : data;
        setPost(nextPost);
        setHasLikedState(nextPost.hasUserLiked);

        hasUserLiked(blogId)
          .then(setHasLikedState)
          .catch(() => undefined);
      } catch {
        const fallback = FALLBACK_POSTS[blogId];
        setPost(fallback || null);
        setHasLikedState(Boolean(fallback?.hasUserLiked));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [blogId]);

  useEffect(() => {
    const updateProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress(maxScroll > 0 ? Math.min(100, Math.round((window.scrollY / maxScroll) * 100)) : 0);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const handleToggleLike = useCallback(async () => {
    if (!post) {
      toast({ title: "Lỗi", description: "Không thể tải bài viết", variant: "destructive" });
      return;
    }

    setLikeLoading(true);
    try {
      const { likeCount, hasLiked: newHasLiked } = await toggleLike(blogId);
      setPost((prev) => (prev ? { ...prev, likeCount, hasUserLiked: newHasLiked } : null));
      setHasLikedState(newHasLiked);
      toast({
        title: "Thành công",
        description: newHasLiked ? "Bạn đã thích bài viết" : "Bạn đã bỏ thích bài viết",
      });
    } catch {
      toast({ title: "Lỗi", description: "Vui lòng đăng nhập để thích bài viết", variant: "destructive" });
    } finally {
      setLikeLoading(false);
    }
  }, [post, blogId]);

  const handleShare = useCallback(async () => {
    if (!post) return;

    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: articleSummary, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Đã sao chép liên kết", description: "Bạn có thể chia sẻ bài viết ngay bây giờ." });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: "Không thể chia sẻ", description: "Vui lòng thử lại sau.", variant: "destructive" });
    }
  }, [articleSummary, post]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ title: "Đã sao chép liên kết", description: "Liên kết bài viết đã nằm trong clipboard." });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: "Không thể sao chép", description: "Trình duyệt chưa cho phép truy cập clipboard.", variant: "destructive" });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7f1]">
        <Navigation />
        <div className="flex min-h-[60vh] items-center justify-center text-[#687d76]">Đang tải bài viết...</div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f5f7f1]">
        <Navigation />
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Không tìm thấy bài viết</h1>
            <Button asChild>
              <Link href="/blog">Quay lại bài viết</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f1]">
      <div className="fixed left-0 top-0 z-[60] h-1 bg-[#e15c45] transition-all duration-200" style={{ width: `${readingProgress}%` }} />
      <Navigation />

      <main>
        <section className="relative overflow-hidden bg-[#16312a] text-white">
          <div className="absolute inset-0">
            <Image src={post.featuredImageUrl || "/placeholder.svg"} alt={post.title} fill priority sizes="100vw" className="object-cover opacity-45" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,38,32,0.96),rgba(12,38,32,0.74),rgba(12,38,32,0.35))]" />
          </div>

          <div className="relative mx-auto grid min-h-[32rem] max-w-7xl items-end gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
            <div className="max-w-3xl">
              <Button asChild variant="outline" className="mb-8 border-white/30 bg-white/12 text-white backdrop-blur hover:bg-white hover:text-[#16312a]">
                <Link href="/blog">
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại bài viết
                </Link>
              </Button>

              <div className="mb-5 flex flex-wrap items-center gap-3">
                <Badge className="bg-[#d8f5df] px-3 py-1 text-[#0c5a3f] hover:bg-[#d8f5df]">{post.tagName}</Badge>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1 text-sm text-white/88 backdrop-blur">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1 text-sm text-white/88 backdrop-blur">
                  <Clock className="h-4 w-4" />
                  {post.readTimeMinutes} phút đọc
                </span>
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">{post.title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#dcebe3]">{articleSummary}</p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button onClick={handleToggleLike} disabled={likeLoading} className="bg-[#e15c45] text-white hover:bg-[#c94c37]">
                  <Heart className={`h-4 w-4 ${hasLikedState ? "fill-white" : ""}`} />
                  Thích ({post.likeCount || 0})
                </Button>
                <Button onClick={handleShare} variant="outline" className="border-white/30 bg-white/12 text-white backdrop-blur hover:bg-white hover:text-[#16312a]">
                  <Share2 className="h-4 w-4" />
                  Chia sẻ
                </Button>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-lg border border-white/20 bg-white/12 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                  <Image src={post.featuredImageUrl || "/placeholder.svg"} alt={post.title} fill sizes="42vw" className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative -mt-10 pb-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
            <article className="overflow-hidden rounded-lg border border-[#dce6df] bg-white shadow-[0_22px_70px_rgba(22,49,42,0.13)]">
              <div className="grid gap-4 border-b border-[#e3ebe6] bg-[#fbfdf9] p-5 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-[#e8f5ef] text-[#1f6654]">
                    <Eye className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#687d76]">Lượt xem</p>
                    <p className="font-semibold text-[#16312a]">{post.viewCount || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-[#fff0e9] text-[#b44735]">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#687d76]">Độ dài</p>
                    <p className="font-semibold text-[#16312a]">{articleWordCount || "Đang cập nhật"} từ</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-[#eef7ff] text-[#2f638a]">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#687d76]">Chủ đề</p>
                    <p className="font-semibold text-[#16312a]">{post.tagName}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="mb-9 flex flex-col gap-5 rounded-lg bg-[#f4f8f4] p-5 sm:flex-row sm:items-center">
                  <Image
                    src={post.authorAvatar || "/placeholder-user.jpg"}
                    alt={post.authorName}
                    width={68}
                    height={68}
                    className="size-17 rounded-full border-4 border-white object-cover shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold uppercase text-[#b44735]">Tác giả</p>
                    <h2 className="text-xl font-semibold text-[#16312a]">{post.authorName}</h2>
                    <p className="mt-1 text-sm leading-6 text-[#526761]">{post.authorExperience}</p>
                  </div>
                </div>

                <div className="mb-8 rounded-lg border border-[#dce6df] bg-white p-5">
                  <p className="mb-2 text-sm font-semibold uppercase text-[#b44735]">Tóm tắt nhanh</p>
                  <p className="text-lg leading-8 text-[#23443b]">{articleSummary}</p>
                </div>

                <div
                  className="blog-article-content max-w-none text-[#16312a]"
                  style={{ fontSize: `${fontScale}rem` }}
                  dangerouslySetInnerHTML={{ __html: post.content || "<p>Nội dung bài viết đang được cập nhật.</p>" }}
                />

                <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-[#dce6df] pt-7">
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                    #{post.tagName}
                  </Badge>
                  <Button onClick={handleToggleLike} disabled={likeLoading} variant="outline" className="gap-2">
                    <Heart className={`h-4 w-4 ${hasLikedState ? "fill-red-500 text-red-500" : "text-[#526761]"}`} />
                    Thích ({post.likeCount || 0})
                  </Button>
                  <Button onClick={handleShare} variant="outline" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Chia sẻ
                  </Button>
                  <Button onClick={handleCopyLink} variant="outline" className="gap-2">
                    {copied ? <Check className="h-4 w-4 text-[#1f6654]" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Đã copy" : "Copy link"}
                  </Button>
                </div>
              </div>
            </article>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <Card className="overflow-hidden border-[#dce6df]">
                <CardContent className="p-0">
                  <div className="bg-[#16312a] p-5 text-white">
                    <p className="text-sm font-semibold uppercase text-[#ffd69f]">Tiến độ đọc</p>
                    <p className="mt-1 text-3xl font-bold text-white">{readingProgress}%</p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/18">
                      <div className="h-full rounded-full bg-[#ffd69f] transition-all" style={{ width: `${readingProgress}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-4">
                    <Button variant={fontScale === 0.95 ? "default" : "outline"} size="sm" onClick={() => setFontScale(0.95)}>
                      A-
                    </Button>
                    <Button variant={fontScale === 1 ? "default" : "outline"} size="sm" onClick={() => setFontScale(1)}>
                      A
                    </Button>
                    <Button variant={fontScale === 1.12 ? "default" : "outline"} size="sm" onClick={() => setFontScale(1.12)}>
                      A+
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#dce6df]">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <Image
                      src={post.authorAvatar || "/placeholder-user.jpg"}
                      alt={post.authorName}
                      width={52}
                      height={52}
                      className="size-13 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-[#16312a]">{post.authorName}</h3>
                      <p className="text-sm text-[#687d76]">PetSitter Journal</p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-[#526761]">{post.authorExperience}</p>
                </CardContent>
              </Card>

              <Card className="border-[#dce6df] bg-[#fff8ef]">
                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold text-[#16312a]">Cần hỗ trợ chăm sóc thú cưng?</h3>
                  <p className="mt-2 text-sm leading-6 text-[#526761]">
                    Khám phá dịch vụ, đặt lịch và trò chuyện với shop phù hợp ngay trong PetSitter.
                  </p>
                  <div className="mt-5 grid gap-2">
                    <Button asChild className="bg-[#e15c45] text-white hover:bg-[#c94c37]">
                      <Link href="/features">
                        <Sparkles className="h-4 w-4" />
                        Xem dịch vụ
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/contact">
                        <MessageCircle className="h-4 w-4" />
                        Liên hệ tư vấn
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
