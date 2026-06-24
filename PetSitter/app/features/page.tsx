"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, MessageCircle, ShieldCheck, Sparkles, Star } from "lucide-react"

import { getListServices } from "@/components/api/feature"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { ServiceImage } from "@/components/service-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Service, ServiceTag } from "@/types/feature"

const priceRanges = ["all", "below10", "below20", "below50"] as const
type PriceRange = (typeof priceRanges)[number]

function buildQuoteHref(service: Service) {
  const params = new URLSearchParams({
    new: service.shop?.shopId || service.shopId,
    serviceId: service.serviceId,
    serviceName: service.serviceName,
    shopName: service.shop?.shopName || "Shop dịch vụ",
    quote: `Xin chào ${service.shop?.shopName || "shop"}, mình muốn nhận báo giá cho dịch vụ "${service.serviceName}". Shop tư vấn giúp mình về giá, thời gian phù hợp và các lưu ý khi đặt lịch nhé.`,
  })

  return `/chat?${params.toString()}`
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [tags, setTags] = useState<ServiceTag[]>([])
  const [loading, setLoading] = useState(true)
  const [locations, setLocations] = useState<string[]>([])
  const [filters, setFilters] = useState<{
    tagId: string
    location: string
    priceRange: PriceRange
  }>({
    tagId: "",
    location: "all",
    priceRange: "all",
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const data = await getListServices()
        setServices(data.services)
        setTags(data.tags)
        setLocations(
          [...new Set(data.services.map((service) => service.shop?.location).filter((location): location is string => !!location))]
        )
      } catch {
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredServices = services.filter((service) => {
    if (filters.tagId && service.tagId !== filters.tagId) return false
    if (filters.location !== "all" && service.shop?.location !== filters.location) return false

    switch (filters.priceRange) {
      case "below10":
        return service.pricePerPerson < 10
      case "below20":
        return service.pricePerPerson < 20
      case "below50":
        return service.pricePerPerson < 50
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto flex min-h-[24rem] max-w-7xl items-center justify-center px-4 text-[#526761]">
          Đang tải dịch vụ...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9fbf9]">
      <Navigation />

      {/* Hero Banner with Modern Gradient and Styling */}
      <PageHero
        eyebrow="ĐẶT LỊCH DỊCH VỤ 5 SAO"
        title="Dịch vụ chăm sóc & spa thú cưng độc quyền tại Đà Nẵng"
        description="Tìm kiếm dịch vụ dắt chó đi dạo, spa chải chuốt, trông giữ hoặc huấn luyện thú cưng tốt nhất, an tâm nhất dành cho các bé yêu."
        imageSrc="/happy-person-dog.png"
        imageAlt="A happy person walking with a dog"
        imageClassName="object-[center_48%]"
      >
        <div className="flex flex-wrap gap-3">
          <Button size="lg" className="h-11 bg-[#e15c45] px-6 text-white hover:bg-[#c94c37] shadow-lg shadow-[#e15c45]/20 rounded-full font-medium transition-all hover:-translate-y-0.5">
            Khám phá dịch vụ
          </Button>
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Chỉ áp dụng tại Đà Nẵng
          </div>
        </div>
      </PageHero>

      {/* Đà Nẵng Exclusive Banner Alert */}
      <div className="bg-[#f0f9f4] border-y border-[#d4eedb] py-3.5 text-center text-sm font-semibold text-[#1a5b3a] flex items-center justify-center gap-2 shadow-inner">
        <MapPin className="size-4 text-[#1f6654] animate-bounce" />
        Dịch vụ chăm sóc thú cưng hiện tại chỉ hỗ trợ khu vực nội thành TP. Đà Nẵng.
      </div>

      <section className="border-b border-[#e2ece6] bg-white">
        <div className="container mx-auto grid max-w-5xl gap-3 px-4 py-6 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-[#e2ece6] bg-[#fbfdfb] p-4">
            <ShieldCheck className="size-5 text-[#1f6654]" />
            <div>
              <p className="text-sm font-bold text-[#16312a]">Shop đã xác thực</p>
              <p className="text-xs text-[#687d76]">Thông tin dịch vụ được kiểm duyệt trước khi hiển thị.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-[#e2ece6] bg-[#fbfdfb] p-4">
            <MessageCircle className="size-5 text-[#b44735]" />
            <div>
              <p className="text-sm font-bold text-[#16312a]">Báo giá qua chat</p>
              <p className="text-xs text-[#687d76]">Gửi yêu cầu tư vấn trực tiếp cho shop chỉ với một nút bấm.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-[#e2ece6] bg-[#fbfdfb] p-4">
            <Sparkles className="size-5 text-amber-500" />
            <div>
              <p className="text-sm font-bold text-[#16312a]">Lịch linh hoạt</p>
              <p className="text-xs text-[#687d76]">Trao đổi nhu cầu, thời gian và lưu ý chăm sóc trước khi đặt.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="border-b border-[#e2ece6] bg-white py-14 shadow-sm">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#b44735] bg-[#fbf1f0] px-3 py-1 rounded-full">Bộ lọc tìm kiếm</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#16312a]">Lựa chọn dịch vụ bạn cần</h2>
            <p className="mt-2 text-[#526761] text-sm">Tìm kiếm nhanh chóng theo phân loại và mức giá mong muốn</p>
          </div>

          <div className="mb-10 text-center">
            <div className="flex flex-wrap justify-center gap-2.5">
              <Button
                variant="outline"
                className={`rounded-full px-5 py-2.5 transition-all ${
                  filters.tagId === ""
                    ? "bg-[#1f6654] text-white hover:bg-[#1f6654] border-[#1f6654] shadow-md shadow-[#1f6654]/10"
                    : "hover:bg-[#f0faf5] hover:text-[#1f6654]"
                }`}
                onClick={() => setFilters((current) => ({ ...current, tagId: "" }))}
              >
                Tất cả dịch vụ
              </Button>
              {tags.map((tag) => (
                <Button
                  key={tag.serviceTagId}
                  variant="outline"
                  className={`rounded-full px-5 py-2.5 transition-all ${
                    filters.tagId === tag.serviceTagId
                      ? "bg-[#1f6654] text-white hover:bg-[#1f6654] border-[#1f6654] shadow-md shadow-[#1f6654]/10"
                      : "hover:bg-[#f0faf5] hover:text-[#1f6654]"
                  }`}
                  onClick={() => setFilters((current) => ({ ...current, tagId: tag.serviceTagId }))}
                >
                  {tag.tagName}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 rounded-2xl border border-[#e2ece6] bg-[#fdfefe] p-6 shadow-sm md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#687d76]">Thành Phố / Khu Vực</p>
              <Select value="DaNang" disabled>
                <SelectTrigger className="h-12 w-full bg-slate-50 border-[#ccdcd0] text-slate-700 font-medium">
                  <SelectValue placeholder="Đà Nẵng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DaNang">Đà Nẵng (Độc quyền)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#687d76]">Khoảng Giá Mong Muốn</p>
              <Select
                value={filters.priceRange}
                onValueChange={(value: PriceRange) => setFilters((current) => ({ ...current, priceRange: value }))}
              >
                <SelectTrigger className="h-12 w-full bg-white border-[#ccdcd0]">
                  <SelectValue placeholder="Chọn khoảng giá" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range === "all" ? "Tất cả mức giá" : range === "below10" ? "Dưới 10.000 đ" : range === "below20" ? "Dưới 20.000 đ" : "Dưới 50.000 đ"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Services List Grid */}
      <section className="bg-[#f5f7f4] py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8 flex items-center justify-between border-b border-[#e2ece6] pb-4">
            <h3 className="text-xl font-bold text-[#16312a]">
              Tìm thấy {filteredServices.length} dịch vụ tại Đà Nẵng
            </h3>
            <span className="text-xs font-medium text-[#526761]">
              Hiển thị kết quả tốt nhất
            </span>
          </div>

          <div className="grid gap-8">
            {filteredServices.map((service) => {
              const reviewCount = service.serviceReviews?.length || 0
              const avgRating =
                reviewCount > 0
                  ? service.serviceReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
                  : 5.0
              return (
                <Card
                  key={service.serviceId}
                  className="group relative gap-0 overflow-hidden border-[#e2ece6] py-0 transition-all duration-300 hover:-translate-y-1 hover:border-[#b6cfbe] hover:shadow-[0_20px_50px_rgba(22,49,42,0.1)] rounded-2xl bg-white"
                >
                  {/* Verified Badge */}
                  <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-semibold backdrop-blur-sm shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                    Đã kiểm duyệt
                  </div>

                  <CardContent className="grid gap-0 p-0 md:grid-cols-[18rem_1fr]">
                    {/* Card Image section with Scale Effect */}
                    <div className="relative min-h-64 overflow-hidden bg-[#f0f4f1]">
                      <ServiceImage
                        src={service.serviceImageUrl}
                        alt={service.serviceName}
                        sizes="(max-width: 768px) 100vw, 288px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    {/* Card Detail Section */}
                    <div className="p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <div className="mb-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                          <div>
                            <h4 className="text-xl md:text-2xl font-bold text-[#16312a] leading-snug group-hover:text-[#1f6654] transition-colors">
                              {service.serviceName}
                            </h4>
                            <p className="mt-2.5 flex items-center gap-1.5 text-sm font-semibold text-[#1f6654]">
                              <MapPin className="size-4" />
                              {service.shop?.shopName || "Cửa hàng đối tác"}
                              <span className="text-xs text-slate-300">|</span>
                              <span className="text-[#b44735]">Đà Nẵng</span>
                            </p>
                          </div>

                          <div className="text-left sm:text-right shrink-0">
                            {service.pricePerPerson ? (
                              <>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Giá từ</p>
                                <p className="text-2xl font-extrabold text-[#b44735]">
                                  {new Intl.NumberFormat("vi-VN").format(service.pricePerPerson)} đ
                                </p>
                                <p className="text-xs text-slate-500 font-medium">/ thú cưng</p>
                              </>
                            ) : (
                              <>
                                <p className="text-xs text-slate-500">Vui lòng</p>
                                <p className="text-sm font-bold text-[#b44735]">liên hệ shop</p>
                                <p className="text-xs text-slate-500">để biết giá</p>
                              </>
                            )}
                          </div>
                        </div>

                        <p className="mb-6 text-sm text-[#526761] leading-relaxed line-clamp-3">
                          {service.description}
                        </p>
                      </div>

                      <div className="flex flex-col gap-4 border-t border-[#f0f4f1] pt-5 sm:flex-row sm:items-center sm:justify-between">
                        {/* Rating Display */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, index) => (
                              <Star
                                key={index}
                                className={`size-4 ${
                                  index < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-slate-600">
                            {avgRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({reviewCount} đánh giá)
                          </span>
                        </div>

                        {/* Booking CTA */}
                        <Button asChild variant="outline" className="rounded-full border-[#b44735] px-5 text-[#b44735] hover:bg-[#fff5ee] hover:text-[#9c3828]">
                          <Link href={buildQuoteHref(service)}>
                            <MessageCircle className="mr-2 size-4" />
                            Báo giá qua chat
                          </Link>
                        </Button>
                        <Button asChild className="bg-[#1f6654] text-white hover:bg-[#174d3f] px-6 rounded-full font-medium transition-all shadow-md shadow-[#1f6654]/10 hover:shadow-lg">
                          <Link href={`/features/booking/${service.serviceId}`}>Xem chi tiết</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredServices.length === 0 && (
            <div className="py-16 text-center bg-white rounded-2xl border border-[#e2ece6] p-8 shadow-sm">
              <MapPin className="size-12 mx-auto text-slate-300 mb-4 animate-pulse" />
              <p className="text-[#687d76] font-medium">Hiện không tìm thấy dịch vụ nào phù hợp với bộ lọc tại Đà Nẵng.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
