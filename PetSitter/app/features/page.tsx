"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Star } from "lucide-react"

import { getListServices } from "@/components/api/feature"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Service, ServiceTag } from "@/types/feature"

const priceRanges = ["all", "below10", "below20", "below50"] as const
type PriceRange = (typeof priceRanges)[number]

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
    <div className="min-h-screen bg-background">
      <Navigation />

      <PageHero
        eyebrow="Đặt dịch vụ thú cưng"
        title="Dịch vụ dắt chó đi dạo, spa, trông giữ và đưa đón thú cưng"
        description="Tìm kiếm dịch vụ thú cưng theo vị trí, giá cả và thông tin chi tiết trước khi đặt lịch."
        imageSrc="/happy-person-dog.png"
        imageAlt="A happy person walking with a dog"
        imageClassName="object-[center_48%]"
      >
        <Button size="lg" className="h-11 bg-[#e15c45] px-6 text-white hover:bg-[#c94c37]">
          Khám phá dịch vụ
        </Button>
      </PageHero>

      <section className="border-b border-[#dce6df] bg-white py-12">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase text-[#b44735]">Tìm kiếm dịch vụ</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#16312a]">Lựa chọn dịch vụ bạn cần</h2>
          </div>

          <div className="mb-8 text-center">
            <p className="mb-4 text-lg font-medium text-[#526761]">Tôi đang tìm kiếm</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant={filters.tagId === "" ? "default" : "outline"}
                onClick={() => setFilters((current) => ({ ...current, tagId: "" }))}
              >
                Tất cả dịch vụ
              </Button>
              {tags.map((tag) => (
                <Button
                  key={tag.serviceTagId}
                  variant={filters.tagId === tag.serviceTagId ? "default" : "outline"}
                  onClick={() => setFilters((current) => ({ ...current, tagId: tag.serviceTagId }))}
                >
                  {tag.tagName}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 rounded-lg border border-[#dce6df] bg-[#f8faf5] p-5 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase text-[#687d76]">Khu vực gần tôi</p>
              <Select
                value={filters.location}
                onValueChange={(value) => setFilters((current) => ({ ...current, location: value }))}
              >
                <SelectTrigger className="h-12 w-full bg-white">
                  <SelectValue placeholder="Chọn địa điểm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả địa điểm</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase text-[#687d76]">Khoảng giá</p>
              <Select
                value={filters.priceRange}
                onValueChange={(value: PriceRange) => setFilters((current) => ({ ...current, priceRange: value }))}
              >
                <SelectTrigger className="h-12 w-full bg-white">
                  <SelectValue placeholder="Chọn khoảng giá" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range === "all" ? "Tất cả mức giá" : range === "below10" ? "Dưới 10 đ" : range === "below20" ? "Dưới 20 đ" : "Dưới 50 đ"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8f3] py-14">
        <div className="container mx-auto px-4">
          <h3 className="mb-8 text-2xl font-semibold text-[#16312a]">
            Tìm thấy {filteredServices.length} dịch vụ tại {filters.location === "all" ? "tất cả địa điểm" : filters.location}
          </h3>

          <div className="grid gap-6">
            {filteredServices.map((service) => {
              const reviewCount = service.serviceReviews.length
              const avgRating =
                reviewCount > 0
                  ? service.serviceReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
                  : 0
              const serviceImage =
                Array.isArray(service.serviceImageUrl) &&
                typeof service.serviceImageUrl[0] === "string" &&
                service.serviceImageUrl[0].trim() !== ""
                  ? service.serviceImageUrl[0]
                  : "/placeholder.svg"

              return (
                <Card
                  key={service.serviceId}
                  className="gap-0 overflow-hidden py-0 transition duration-300 hover:-translate-y-0.5 hover:border-[#bfd1c8] hover:shadow-[0_18px_46px_rgba(22,49,42,0.14)]"
                >
                  <CardContent className="grid gap-0 p-0 md:grid-cols-[16rem_1fr]">
                    <div className="relative min-h-60 overflow-hidden bg-[#edf3ee]">
                      <Image
                        src={serviceImage}
                        alt={service.serviceName}
                        fill
                        sizes="(max-width: 768px) 100vw, 256px"
                        className="object-cover contrast-[1.03]"
                      />
                    </div>

                    <div className="p-6">
                      <div className="mb-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                          <h4 className="text-xl font-semibold text-[#16312a]">{service.serviceName}</h4>
                          <p className="mt-2 flex items-center gap-1 text-[#687d76]">
                            <MapPin className="size-4" />
                            {service.shop?.location || "Không rõ địa điểm"}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          {service.pricePerPerson ? (
                            <>
                              <p className="text-sm text-[#687d76]">Từ</p>
                              <p className="text-lg font-semibold text-[#b44735]">
                                {new Intl.NumberFormat("vi-VN").format(service.pricePerPerson)} đ
                              </p>
                              <p className="text-sm text-[#687d76]">/ người</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-[#687d76]">Vui lòng</p>
                              <p className="text-sm font-semibold text-[#b44735]">liên hệ shop</p>
                              <p className="text-sm text-[#687d76]">để biết giá</p>
                            </>
                          )}
                        </div>
                      </div>

                      <p className="mb-5 line-clamp-3 text-[#526761]">{service.description}</p>

                      <div className="flex flex-col gap-4 border-t border-[#e0e8e2] pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, index) => (
                              <Star
                                key={index}
                                className={`size-4 ${
                                  index < Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-[#687d76]">
                            {avgRating.toFixed(1)} ({reviewCount} đánh giá)
                          </span>
                        </div>

                        <Button asChild className="bg-[#e15c45] text-white hover:bg-[#c94c37]">
                          <Link href={`/features/booking/${service.serviceId}`}>Xem chi tiết</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredServices.length === 0 && <p className="py-8 text-center text-[#687d76]">Không tìm thấy dịch vụ nào phù hợp với bộ lọc.</p>}
        </div>
      </section>

      <Footer />
    </div>
  )
}
