"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, MapPin, Search, Star, Store } from "lucide-react"

import { getServicesByShopId } from "@/components/api/feature"
import { listProducts } from "@/components/api/product"
import { getProductsByShopId } from "@/components/api/shop"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { ProductCard } from "@/components/product-card"
import ProductFiltersComponent from "@/components/product-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Service } from "@/types/feature"
import type { Product, ProductFilters } from "@/types/product"

function ShopPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const shopIdParam = searchParams?.get("shopId")
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    brands: [],
    tags: [],
    priceRange: [0, 0],
    sortBy: "latest",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [products, setProducts] = useState<Product[]>([])
  const [shopServices, setShopServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 12

  useEffect(() => {
    setLoading(true)
    setError(null)

    const productRequest = shopIdParam
      ? getProductsByShopId(shopIdParam).then((response) => {
          if (!response.success) {
            throw new Error(response.message || "Không thể tải sản phẩm của cửa hàng")
          }
          return response.data || []
        })
      : listProducts()

    productRequest
      .then((data) => {
        setProducts(data)
        setCurrentPage(1)
      })
      .catch((err) => {
        setError(err.message || "Không thể tải danh sách sản phẩm")
      })
      .finally(() => setLoading(false))
  }, [shopIdParam])

  useEffect(() => {
    if (!shopIdParam) {
      setShopServices([])
      return
    }

    setServicesLoading(true)
    getServicesByShopId(shopIdParam)
      .then(setShopServices)
      .catch(() => setShopServices([]))
      .finally(() => setServicesLoading(false))
  }, [shopIdParam])

  useEffect(() => {
    if (products.length === 0) return

    const maxPrice = Math.max(...products.map((product) => product.price))
    setFilters((current) =>
      current.priceRange[0] === 0 && current.priceRange[1] === 0
        ? { ...current, priceRange: [0, maxPrice] }
        : current
    )
  }, [products])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters, searchQuery, shopIdParam])

  const filterSourceProducts = useMemo(() => {
    return shopIdParam ? products.filter((product) => product.shopId === shopIdParam) : products
  }, [products, shopIdParam])

  const activeShopName = useMemo(() => {
    if (!shopIdParam) return ""

    const product = filterSourceProducts[0]
    return product?.shopName || shopServices[0]?.shop?.shopName || "Cửa hàng đối tác"
  }, [filterSourceProducts, shopIdParam, shopServices])

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return products
      .filter((product) => {
        if (shopIdParam && product.shopId !== shopIdParam) return false
        if (query && !product.productName.toLowerCase().includes(query)) return false
        if (filters.categories.length > 0 && !filters.categories.includes(product.categoryName)) return false
        if (filters.brands.length > 0 && !filters.brands.includes(product.brandName)) return false
        if (filters.tags.length > 0 && !filters.tags.some((tag) => product.tags.includes(tag))) return false
        if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false
        return true
      })
      .sort((first, second) => {
        switch (filters.sortBy) {
          case "price-low":
            return first.price - second.price
          case "price-high":
            return second.price - first.price
          case "rating":
            return second.rating - first.rating
          default:
            return 0
        }
      })
  }, [filters, products, searchQuery, shopIdParam])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages)
    setCurrentPage(nextPage)
    window.scrollTo({ top: 520, behavior: "smooth" })
  }

  const cacheServiceForDetail = (service: Service) => {
    try {
      sessionStorage.setItem(`service:${service.serviceId}`, JSON.stringify(service))
    } catch {
      // Browsers can block storage; the detail page will still fetch normally.
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <PageHero
        eyebrow="Phụ kiện & Nhu yếu phẩm"
        title="Sản phẩm chăm sóc thú cưng mỗi ngày"
        description="Tìm kiếm thức ăn, đồ chơi, dụng cụ vệ sinh và các nhu yếu phẩm thiết thực từ các cửa hàng đối tác của PetSitter."
        imageSrc="/happy-pets.png"
        imageAlt="Thú cưng nằm bên nhau"
        imageClassName="object-[center_58%]"
      >
        <div className="flex max-w-xl flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#687d76]" />
            <Input
              placeholder="Tìm sản phẩm..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-11 border-white bg-white pl-10 text-[#16312a]"
            />
          </div>
          <Button onClick={() => setCurrentPage(1)} className="h-11 bg-[#e15c45] px-6 text-white hover:bg-[#c94c37]">
            Tìm kiếm
          </Button>
        </div>
      </PageHero>

      {shopIdParam ? (
        <section className="bg-[#f7f8f3] py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-lg border border-[#efcfbf] bg-[#fff5ee] p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-[#f8d8ca] p-2 text-[#b44735]">
                  <Store className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#b44735]">Trang cửa hàng</p>
                  <h2 className="text-xl font-semibold text-[#16312a]">{activeShopName}</h2>
                  <p className="text-sm text-[#687d76]">Sản phẩm và dịch vụ đang cung cấp bởi cửa hàng này</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/shop")}>
                Xem tất cả sản phẩm
              </Button>
            </div>

            <div className="mb-12">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-[#b44735]">Sản phẩm</p>
                  <h3 className="text-2xl font-semibold text-[#16312a]">Sản phẩm của cửa hàng</h3>
                </div>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: ProductFilters["sortBy"]) => setFilters((current) => ({ ...current, sortBy: value }))}
                >
                  <SelectTrigger className="w-44 bg-white">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Mới nhất</SelectItem>
                    <SelectItem value="price-low">Giá: Thấp đến Cao</SelectItem>
                    <SelectItem value="price-high">Giá: Cao đến Thấp</SelectItem>
                    <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="rounded-lg border bg-white py-16 text-center text-[#687d76]">Đang tải sản phẩm...</div>
              ) : error ? (
                <div className="rounded-lg border bg-white py-8 text-center text-red-600">{error}</div>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-lg border bg-white py-16 text-center text-[#687d76]">
                  Cửa hàng này hiện chưa có sản phẩm nào.
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.productId} product={product} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Trang trước"
                        className="h-12 w-12 rounded-md p-0"
                      >
                        <ChevronLeft className="size-4" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, index) => {
                        const page = index + 1
                        const isActive = currentPage === page
                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => goToPage(page)}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex h-12 w-12 items-center justify-center rounded-md border text-base font-semibold shadow-sm transition-all ${
                              isActive
                                ? "border-[#a23820] bg-[#a23820] text-white"
                                : "border-gray-200 bg-white text-[#16312a] hover:border-[#a23820] hover:text-[#a23820]"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                      <Button
                        variant="outline"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Trang tiếp theo"
                        className="h-12 w-12 rounded-md p-0"
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase text-[#b44735]">Dịch vụ</p>
                <h3 className="text-2xl font-semibold text-[#16312a]">Dịch vụ của cửa hàng</h3>
              </div>

              {servicesLoading ? (
                <div className="rounded-lg border bg-white py-16 text-center text-[#687d76]">Đang tải dịch vụ của shop...</div>
              ) : shopServices.length === 0 ? (
                <div className="rounded-lg border bg-white py-16 text-center text-[#687d76]">
                  Cửa hàng này hiện chưa có dịch vụ nào.
                </div>
              ) : (
                <div className="grid gap-6">
                  {shopServices.map((service) => {
                    const reviewCount = service.serviceReviews.length
                    const avgRating =
                      reviewCount > 0
                        ? service.serviceReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
                        : 0
                    const serviceImage =
                      Array.isArray(service.serviceImageUrl)
                        ? (service.serviceImageUrl[0] || "/placeholder.svg")
                        : (service.serviceImageUrl || "/placeholder.svg")

                    return (
                      <div
                        key={service.serviceId}
                        className="grid overflow-hidden rounded-lg border bg-white shadow-sm transition hover:border-[#bfd1c8] hover:shadow-[0_18px_46px_rgba(22,49,42,0.14)] md:grid-cols-[16rem_1fr]"
                      >
                        <div className="relative min-h-60 overflow-hidden bg-[#edf3ee]">
                          <Image
                            src={serviceImage}
                            alt={service.serviceName}
                            fill
                            sizes="(max-width: 768px) 100vw, 256px"
                            className="object-cover"
                          />
                        </div>
                        <div className="p-6">
                          <div className="mb-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                            <div>
                              <h3 className="text-xl font-semibold text-[#16312a]">{service.serviceName}</h3>
                              <p className="mt-2 flex items-center gap-1 text-[#687d76]">
                                <MapPin className="size-4" />
                                {service.shop?.location || "Không rõ địa điểm"}
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-sm text-[#687d76]">Từ</p>
                              <p className="text-lg font-semibold text-[#b44735]">
                                {new Intl.NumberFormat("vi-VN").format(service.pricePerPerson)} đ
                              </p>
                              <p className="text-sm text-[#687d76]">/ thú cưng</p>
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
                              <Link
                                href={`/features/booking/${service.serviceId}`}
                                onClick={() => cacheServiceForDetail(service)}
                              >
                                Xem chi tiết
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-[#f7f8f3] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <ProductFiltersComponent filters={filters} onFiltersChange={setFilters} products={filterSourceProducts} />
              </div>

              <div className="lg:col-span-3">
                <div className="mb-6 flex flex-col gap-4 border-b border-[#dce6df] pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[#687d76]">
                    Hiển thị {filteredProducts.length === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)}-
                    {Math.min(currentPage * itemsPerPage, filteredProducts.length)} trong số {filteredProducts.length} kết quả
                  </p>

                  <Select
                    value={filters.sortBy}
                    onValueChange={(value: ProductFilters["sortBy"]) => setFilters((current) => ({ ...current, sortBy: value }))}
                  >
                    <SelectTrigger className="w-full bg-white sm:w-48">
                      <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Mới nhất</SelectItem>
                      <SelectItem value="price-low">Giá: Thấp đến Cao</SelectItem>
                      <SelectItem value="price-high">Giá: Cao đến Thấp</SelectItem>
                      <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="py-20 text-center text-[#687d76]">Đang tải sản phẩm...</div>
                ) : error ? (
                  <div className="py-8 text-center text-red-600">{error}</div>
                ) : (
                  <>
                    <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {paginatedProducts.map((product) => (
                        <ProductCard key={product.productId} product={product} />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button
                          variant="outline"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="h-12 w-12 rounded-md p-0"
                          aria-label="Trang trước"
                        >
                          <ChevronLeft className="size-4" />
                        </Button>
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              onClick={() => goToPage(page)}
                              className={`h-12 w-12 rounded-md p-0 text-base font-semibold ${
                                currentPage === page
                                  ? "border-[#a23820] bg-[#a23820] text-white hover:bg-[#8e2e1a]"
                                  : "border-gray-200 bg-white text-[#16312a] hover:border-[#a23820] hover:text-[#a23820]"
                              }`}
                            >
                              {page}
                            </Button>
                          )
                        })}
                        <Button
                          variant="outline"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="h-12 w-12 rounded-md p-0"
                          aria-label="Trang tiếp theo"
                        >
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-[#687d76]">Đang tải cửa hàng...</div>
      }
    >
      <ShopPageContent />
    </Suspense>
  )
}
