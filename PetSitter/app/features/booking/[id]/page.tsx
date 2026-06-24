"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { ServiceImage } from "@/components/service-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import { DEFAULT_SHOP_AVATAR, getAvatarUrl } from "@/lib/avatar";
import type { Service } from "@/types/feature";

function RatingStars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${star <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
        />
      ))}
    </div>
  );
}

function WriteReviewDialog({ serviceId, onReviewAdded }: { serviceId: string; onReviewAdded: (review: any) => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để viết đánh giá.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/service/write-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          serviceId,
          context: comment.trim(),
          rating,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Gửi đánh giá thất bại.");
      }

      onReviewAdded(result.data);
      setOpen(false);
      setComment("");
      setRating(5);
      toast.success("Đã gửi đánh giá của bạn.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gửi đánh giá thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" className="border-[#b44735] text-[#b44735] hover:bg-[#fff5ee]" onClick={() => setOpen(true)}>
        Viết đánh giá
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đánh giá dịch vụ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`size-7 cursor-pointer ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            <Textarea
              placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ này..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="min-h-28"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={loading} className="bg-[#1f6654] hover:bg-[#174d3f]">
              {loading ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function BookingPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const router = useRouter();
  const { user, token } = useAuth();
  const { announceServiceBooking } = useNotifications();

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingNote, setBookingNote] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleCreateBooking = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt lịch dịch vụ.");
      router.push("/login");
      return;
    }

    if (!bookingDate) {
      toast.error("Vui lòng chọn ngày và giờ đặt lịch.");
      return;
    }

    const selectedDate = new Date(bookingDate);
    const now = new Date();
    if (selectedDate <= now) {
      toast.error("Lịch đặt dịch vụ phải ở thời gian tương lai.");
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: service?.serviceId,
          bookingDate: new Date(bookingDate).toISOString(),
          note: bookingNote.trim(),
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Đặt lịch thất bại.");
      }

      toast.success("Đặt lịch dịch vụ thành công!");
      setBookingOpen(false);
      setBookingDate("");
      setBookingNote("");
      router.push("/orders?tab=bookings");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đặt lịch thất bại.");
    } finally {
      setBookingLoading(false);
    }
  };

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchServiceDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const cachedService = sessionStorage.getItem(`service:${serviceId}`);
        if (cachedService) {
          setService(JSON.parse(cachedService));
          setLoading(false);
        }
      } catch {}

      try {
        const res = await fetch(`/api/service/service/${serviceId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Không tải được chi tiết dịch vụ.");

        const result = await res.json();
        if (!isMounted) return;

        setService(result.data);
        try {
          sessionStorage.setItem(`service:${serviceId}`, JSON.stringify(result.data));
        } catch {}
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchServiceDetail();

    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  const reviewCount = service?.serviceReviews?.length || 0;
  const avgRating = useMemo(() => {
    if (!service || reviewCount === 0) return 5;
    return service.serviceReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount;
  }, [reviewCount, service]);

  const handleQuoteChat = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để chat với shop.");
      router.push("/login");
      return;
    }

    if (!service?.shop?.shopId) {
      toast.error("Không tìm thấy thông tin shop.");
      return;
    }

    const params = new URLSearchParams({
      new: service.shop.shopId,
      serviceId: service.serviceId,
      serviceName: service.serviceName,
      shopName: service.shop.shopName || "Shop dịch vụ",
      quote: `Xin chào ${service.shop.shopName || "shop"}, mình muốn nhận báo giá cho dịch vụ "${service.serviceName}". Shop tư vấn giúp mình về giá, lịch trống và các lưu ý khi đặt lịch nhé.`,
    });

    announceServiceBooking(service.serviceName, service.shop.shopName || "Shop dịch vụ").catch(() => undefined);
    router.push(`/chat?${params.toString()}`);
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="flex min-h-screen items-center justify-center bg-[#f7faf7] text-[#526761]">
          Đang tải chi tiết dịch vụ...
        </div>
        <Footer />
      </>
    );
  }

  if (error || !service) {
    return (
      <>
        <Navigation />
        <div className="flex min-h-screen items-center justify-center bg-[#f7faf7] px-4">
          <Card className="max-w-md text-center">
            <CardContent className="p-8">
              <h1 className="mb-3 text-2xl font-bold text-[#16312a]">Không tìm thấy dịch vụ</h1>
              <p className="mb-6 text-sm text-[#687d76]">{error || "Dịch vụ này hiện không khả dụng."}</p>
              <Button asChild className="bg-[#1f6654] hover:bg-[#174d3f]">
                <Link href="/features">Quay lại dịch vụ</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[#f7faf7]">
        <section className="border-b border-[#dce6df] bg-white">
          <div className="container mx-auto max-w-6xl px-4 py-6">
            <Button variant="ghost" asChild className="mb-4 text-[#526761] hover:text-[#16312a]">
              <Link href="/features">
                <ArrowLeft className="mr-2 size-4" />
                Quay lại dịch vụ
              </Link>
            </Button>

            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-[#eef8f3] px-3 py-1 text-xs font-bold text-[#1f6654]">
                    <ShieldCheck className="mr-1.5 size-3.5" />
                    Shop đã xác thực
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#fff5ee] px-3 py-1 text-xs font-bold text-[#b44735]">
                    Báo giá qua chat
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold leading-tight text-[#16312a] md:text-4xl">{service.serviceName}</h1>
                <p className="mt-4 max-w-2xl text-[#526761]">{service.description}</p>
                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-[#687d76]">
                  <span className="flex items-center gap-2">
                    <Store className="size-4 text-[#1f6654]" />
                    {service.shop?.shopName || "Shop dịch vụ"}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-[#b44735]" />
                    {service.shop?.location || service.shop?.address || "Đà Nẵng"}
                  </span>
                  <span className="flex items-center gap-2">
                    <RatingStars value={avgRating} />
                    {avgRating.toFixed(1)} ({reviewCount} đánh giá)
                  </span>
                </div>
              </div>

              <Card className="border-[#dce6df] shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <img
                      src={getAvatarUrl(service.shop?.shopImageUrl, DEFAULT_SHOP_AVATAR)}
                      alt={service.shop?.shopName || "Shop dịch vụ"}
                      className="size-14 rounded-full border object-cover"
                    />
                    <div>
                      <p className="font-bold text-[#16312a]">{service.shop?.shopName || "Shop dịch vụ"}</p>
                      <p className="text-sm text-[#687d76]">{service.shop?.address || "Địa chỉ đang cập nhật"}</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#f7faf7] p-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#687d76]">Giá tham khảo</p>
                    {service.pricePerPerson > 0 ? (
                      <>
                        <p className="mt-1 text-3xl font-extrabold text-[#b44735]">
                          {new Intl.NumberFormat("vi-VN").format(service.pricePerPerson)} đ
                        </p>
                        <p className="text-xs text-[#687d76] font-medium mt-0.5">/ thú cưng</p>
                      </>
                    ) : (
                      <p className="mt-1 text-lg font-bold text-[#b44735]">Liên hệ shop để nhận giá</p>
                    )}
                  </div>
                  <Button className="mt-4 w-full bg-[#b44735] hover:bg-[#9c3828]" onClick={handleQuoteChat}>
                    <MessageCircle className="mr-2 size-4" />
                    Nhận báo giá qua chat
                  </Button>
                  <Button className="mt-2 w-full bg-[#1f6654] hover:bg-[#174d3f] text-white" onClick={() => {
                    if (!user) {
                      toast.error("Vui lòng đăng nhập để đặt lịch dịch vụ.");
                      router.push("/login");
                      return;
                    }
                    setBookingOpen(true);
                  }}>
                    <CalendarCheck className="mr-2 size-4" />
                    Đặt lịch dịch vụ ngay
                  </Button>
                  {service.shop?.socialMediaLinks && (
                    <Button asChild variant="outline" className="mt-2 w-full">
                      <Link href={service.shop.socialMediaLinks} target="_blank">
                        Trang của shop
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="container mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <Card className="overflow-hidden border-[#dce6df] shadow-sm">
              <CardContent className="p-0">
                <div className="relative h-[24rem] w-full bg-[#eef3ee]">
                  <ServiceImage
                    src={service.serviceImageUrl}
                    alt={`Ảnh dịch vụ ${service.serviceName}`}
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 760px"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: MessageCircle, title: "Chat báo giá", text: "Tin nhắn mẫu tự điền tên dịch vụ và shop." },
                { icon: CalendarCheck, title: "Hẹn lịch dễ dàng", text: "Trao đổi thời gian và địa điểm trước khi đặt." },
                { icon: CheckCircle2, title: "Rõ thông tin", text: "Xem shop, giá, mô tả và đánh giá tại một nơi." },
              ].map((item) => (
                <Card key={item.title} className="border-[#dce6df] shadow-sm">
                  <CardContent className="p-4">
                    <item.icon className="mb-3 size-5 text-[#1f6654]" />
                    <h3 className="text-sm font-bold text-[#16312a]">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#687d76]">{item.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-[#dce6df] shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#16312a]">Mô tả dịch vụ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#526761]">
                <p className="leading-relaxed">{service.description}</p>
                <div className="grid gap-3 rounded-lg bg-[#f7faf7] p-4 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-[#16312a]">Shop:</span> {service.shop?.shopName || "Đang cập nhật"}
                  </p>
                  <p>
                    <span className="font-semibold text-[#16312a]">Khu vực:</span> {service.shop?.location || "Đà Nẵng"}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="font-semibold text-[#16312a]">Địa chỉ:</span> {service.shop?.address || "Đang cập nhật"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#dce6df] shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-[#16312a]">{reviewCount} đánh giá</CardTitle>
                <WriteReviewDialog
                  serviceId={service.serviceId}
                  onReviewAdded={(newReview) => {
                    setService((prev) =>
                      prev ? { ...prev, serviceReviews: [...(prev.serviceReviews || []), newReview] } : prev,
                    );
                  }}
                />
              </CardHeader>
              <CardContent className="space-y-4">
                {reviewCount === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#dce6df] p-8 text-center text-sm text-[#687d76]">
                    Chưa có đánh giá nào cho dịch vụ này.
                  </div>
                ) : (
                  service.serviceReviews.map((review) => (
                    <div key={review.reviewId} className="flex gap-3 rounded-lg border border-[#eef3ee] p-4">
                      <img
                        src={getAvatarUrl(review.users?.profilePictureUrl)}
                        alt={review.users?.fullName || "Người dùng"}
                        className="size-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[#16312a]">{review.users?.fullName || "Ẩn danh"}</span>
                          <RatingStars value={review.rating} />
                          <span className="text-xs text-[#8a9a94]">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : ""}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-[#526761]">{review.comment}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className="sticky top-24 border-[#dce6df] shadow-sm">
              <CardContent className="p-5">
                <h3 className="mb-3 text-lg font-bold text-[#16312a]">Cần shop tư vấn?</h3>
                <p className="mb-4 text-sm leading-relaxed text-[#687d76]">
                  Gửi yêu cầu báo giá qua chat để shop tư vấn giá, lịch trống và các lưu ý riêng cho thú cưng của bạn.
                </p>
                <Button className="w-full bg-[#b44735] hover:bg-[#9c3828]" onClick={handleQuoteChat}>
                  <MessageCircle className="mr-2 size-4" />
                  Báo giá qua chat
                </Button>
                <Button className="mt-2 w-full bg-[#1f6654] hover:bg-[#174d3f] text-white" onClick={() => {
                  if (!user) {
                    toast.error("Vui lòng đăng nhập để đặt lịch dịch vụ.");
                    router.push("/login");
                    return;
                  }
                  setBookingOpen(true);
                }}>
                  <CalendarCheck className="mr-2 size-4" />
                  Đặt lịch dịch vụ ngay
                </Button>
                <div className="mt-5 space-y-3 text-sm text-[#526761]">
                  <div className="flex items-center gap-3">
                    <Phone className="size-4 text-[#1f6654]" />
                    Liên hệ qua nền tảng
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="size-4 text-[#1f6654]" />
                    {service.shop?.location || "Đà Nẵng"}
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="size-4 text-[#1f6654]" />
                    Shop dịch vụ đã được kiểm duyệt
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </section>

        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#16312a]">Đặt lịch dịch vụ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-[#f7faf7] p-4 text-[#23443b]">
                <p className="font-semibold">{service.serviceName}</p>
                <p className="text-sm text-gray-500 mt-1">Cửa hàng: {service.shop?.shopName}</p>
                {service.pricePerPerson > 0 ? (
                  <>
                    <p className="text-base font-bold text-[#b44735] mt-2">
                      Giá: {new Intl.NumberFormat("vi-VN").format(service.pricePerPerson)} đ
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">/ thú cưng</p>
                  </>
                ) : (
                  <p className="text-base font-bold text-[#b44735] mt-2">Giá liên hệ</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="booking-date" className="text-sm font-semibold text-gray-700">Ngày & Giờ đặt lịch *</Label>
                <Input
                  id="booking-date"
                  type="datetime-local"
                  value={bookingDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBookingDate(val);
                    // Real-time validation: clear if past time selected
                    if (val) {
                      const selected = new Date(val);
                      if (selected <= new Date()) {
                        toast.warning("Vui lòng chọn thời gian trong tương lai.");
                      }
                    }
                  }}
                  className="w-full text-black bg-white"
                  min={(() => {
                    // Get current local datetime in format YYYY-MM-DDTHH:mm
                    // Add 1 minute buffer so "now" is always invalid
                    const d = new Date(Date.now() + 60000);
                    const pad = (n: number) => String(n).padStart(2, '0');
                    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                  })()}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-note" className="text-sm font-semibold text-gray-700">Ghi chú cho cửa hàng</Label>
                <Textarea
                  id="booking-note"
                  placeholder="Ví dụ: Giống cún nhà mình là Corgi, nặng 10kg..."
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                  className="min-h-24"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setBookingOpen(false)} disabled={bookingLoading}>
                Hủy
              </Button>
              <Button onClick={handleCreateBooking} disabled={bookingLoading} className="bg-[#1f6654] hover:bg-[#174d3f] text-white">
                {bookingLoading ? "Đang xử lý..." : "Xác nhận đặt lịch"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </>
  );
}
