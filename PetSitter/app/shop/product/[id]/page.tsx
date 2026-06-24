"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Star, ShoppingCart, Minus, Plus, ArrowLeft, Store, MessageCircle } from "lucide-react"
import { getProductById, getRelatedProduct, productReview, writeProductReview } from "@/components/api/product" 
import type { Product } from "@/types/product"
import type { Review } from "@/types/review"
import { useCart } from "@/contexts/cart-context" 
import { useAuth } from "@/contexts/auth-context" 
import { toast } from "sonner" 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { DEFAULT_SHOP_AVATAR, getAvatarUrl } from "@/lib/avatar"
import { getVariantOptions } from "@/lib/variants"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params?.id as string | undefined
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [averageRating, setAverageRating] = useState<number>(0)
  const { addToCart } = useCart() // Lấy hàm addToCart từ context
  const { user } = useAuth()
  const [selectedVariant, setSelectedVariant] = useState<string>("")

  useEffect(() => {
    if (product) {
      const opts = getVariantOptions(product.productName, product.categoryName);
      setSelectedVariant(opts[0]);
    }
  }, [product]);

  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")

  const handleSubmitReview = async () => {
    if (!product) return

    try {
      // Lấy user từ localStorage
      const userData = localStorage.getItem("user")
      if (!userData) {
        toast.error("Bạn phải đăng nhập để viết đánh giá")
        return
      }

      const user = JSON.parse(userData)

      const result = await writeProductReview({
        userId: user.userId,
        productId: product.productId,
        context: comment,
        rating,
      })

      toast.success("Đánh giá đã được gửi thành công!")
      // refresh lại reviews
      setReviews((prev) => [...prev, result.data])
      setOpen(false)
      setRating(0)
      setComment("")
      router.refresh();
    } catch (err) {
      toast.error("Gửi đánh giá thất bại")
    }
  }

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      router.push("/login");
      return;
    }
    addToCart(product, quantity, selectedVariant);
    toast.success(`${product.productName} (${selectedVariant}) đã được thêm vào giỏ hàng!`);
  };

  useEffect(() => {
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, r) => sum + r.rating, 0)
      setAverageRating(total / reviews.length)
    } else {
      setAverageRating(0)
    }
  }, [reviews])

  useEffect(() => {
    if (!productId) return

    let isMounted = true
    setLoading(true)

    try {
      const cachedProduct = sessionStorage.getItem(`product:${productId}`)
      if (cachedProduct) {
        setProduct(JSON.parse(cachedProduct))
        setLoading(false)
      }
    } catch {
      // Ignore corrupted or unavailable session storage.
    }

    getProductById(productId)
      .then((data) => {
        if (!isMounted) return
        setProduct(data)
        try {
          sessionStorage.setItem(`product:${productId}`, JSON.stringify(data))
        } catch {}
      })
      .catch(() => {
        if (isMounted) setProduct(null)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [productId])

  useEffect(() => {
    if (productId) {
      getRelatedProduct(productId)
        .then((data) => setRelatedProducts(data))
        .catch(() => setRelatedProducts([]))
    }
  }, [productId])

  useEffect(() => {
    if (productId) {
      setLoadingReviews(true)
      productReview(productId)
        .then(setReviews)
        .catch(() => setReviews([]))
        .finally(() => setLoadingReviews(false))
    }
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h1>
          <Button onClick={() => router.push("/shop")}>Quay lại Cửa hàng</Button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-6 font-medium">
          <Link href="/" className="hover:text-[#ee4d2d]">PetSitter</Link>
          <span>&gt;</span>
          <Link href="/shop" className="hover:text-[#ee4d2d]">Cửa hàng</Link>
          <span>&gt;</span>
          <span className="hover:text-[#ee4d2d] cursor-pointer">{product.categoryName}</span>
          <span>&gt;</span>
          <span className="text-gray-900 truncate max-w-[200px]">{product.productName}</span>
        </div>

        {/* Product Main Container */}
        <div className="bg-white rounded-sm p-6 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Product Images (Left Column) */}
          <div className="md:col-span-5 space-y-4">
            <div className="aspect-square bg-gray-50 rounded-sm overflow-hidden border border-gray-100 flex items-center justify-center">
              <img
                src={product.productImageUrl || "/placeholder.svg"}
                alt={product.productName}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Social Share / Likes */}
            <div className="flex items-center justify-center space-x-6 text-sm py-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <span>Chia sẻ:</span>
                {/* Mock icons matching Shopee share */}
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer">f</span>
                <span className="w-5 h-5 rounded-full bg-sky-400 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer">t</span>
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer">p</span>
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="flex items-center space-x-1.5 text-gray-600 hover:text-red-500"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                <span>Đã thích ({isFavorite ? 131 : 130})</span>
              </button>
            </div>
          </div>

          {/* Product Info (Right Column) */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#d0011b] text-white text-[10px] font-extrabold px-1 rounded uppercase tracking-wider leading-none py-0.5">
                  Chính hãng
                </span>
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-none font-medium text-xs px-2.5 py-0.5 rounded-sm">
                  {product.categoryName}
                </Badge>
              </div>
              
              <h1 className="text-xl font-semibold text-gray-900 mb-3 leading-snug">
                {product.productName}
              </h1>

              {/* Shopee ratings block */}
              <div className="flex items-center space-x-4 mb-4 text-sm divide-x divide-gray-200">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[#ee4d2d] border-b border-[#ee4d2d] font-bold text-base leading-none">
                    {averageRating > 0 ? averageRating.toFixed(1) : "4.9"}
                  </span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.round(averageRating || 4.9) ? "fill-[#ee4d2d] text-[#ee4d2d]" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="pl-4 flex items-center space-x-1">
                  <span className="font-bold border-b border-gray-900">{reviews.length > 0 ? reviews.length : "366"}</span>
                  <span className="text-gray-500 text-xs">Đánh giá</span>
                </div>
                
                <div className="pl-4 flex items-center space-x-1">
                  <span className="font-bold">1k+</span>
                  <span className="text-gray-500 text-xs">Đã bán</span>
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-[#fafafa] px-5 py-4 flex items-center rounded-sm mb-4 flex-wrap gap-4">
              <span className="text-sm text-gray-400 line-through">
                {new Intl.NumberFormat("vi-VN").format(product.price * 1.25)} đ
              </span>
              <span className="text-3xl font-extrabold text-[#ee4d2d]">
                {new Intl.NumberFormat("vi-VN").format(product.price)} đ
              </span>
              <span className="bg-[#ee4d2d] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase leading-none">
                GIẢM 25%
              </span>
            </div>

            {/* Vận chuyển */}
            <div className="py-4 space-y-4 border-b border-gray-100 text-sm">
              <div className="flex items-start">
                <span className="w-28 text-gray-500 shrink-0">Vận chuyển</span>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <img 
                      src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/c5352c3c62934a4c6a65529f7cf7c6c4.png" 
                      className="w-5 h-5 object-contain"
                      alt="Miễn phí vận chuyển"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span>Miễn phí vận chuyển</span>
                  </div>
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <span className="text-gray-400">Vận chuyển đến:</span> 
                    <span className="text-gray-900 font-medium">Hà Nội, Việt Nam</span>
                  </p>
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <span className="text-gray-400">Phí vận chuyển:</span> 
                    <span className="text-gray-900 font-medium">0 đ</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Variants options (Phân loại) */}
            <div className="py-4 space-y-4 border-b border-gray-100 text-sm">
              <div className="flex items-center">
                <span className="w-28 text-gray-500 shrink-0">Phân loại</span>
                <div className="flex flex-wrap gap-2">
                  {product && getVariantOptions(product.productName, product.categoryName).map((variantOpt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      onClick={() => setSelectedVariant(variantOpt)}
                      className={`h-9 px-4 rounded-sm border text-xs font-medium ${
                        selectedVariant === variantOpt
                          ? "border-[#ee4d2d] text-[#ee4d2d] bg-[#ee4d2d]/5 hover:bg-[#ee4d2d]/10"
                          : "border-gray-200 text-gray-800 hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
                      }`}
                    >
                      {variantOpt}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity select */}
            <div className="py-4 space-y-4 border-b border-gray-100 text-sm">
              <div className="flex items-center">
                <span className="w-28 text-gray-500 shrink-0">Số lượng</span>
                <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden h-8 w-fit mr-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-full flex items-center justify-center border-r hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 h-full flex items-center justify-center text-sm font-semibold text-gray-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-full flex items-center justify-center border-l hover:bg-gray-50 text-gray-600"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-gray-500 text-xs uppercase font-medium">
                  {product.availabilityStatus ? "CÒN HÀNG" : "HẾT HÀNG"}
                </span>
              </div>
            </div>

            {/* Add to Cart and Buy now */}
            <div className="pt-4 flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                onClick={handleAddToCart} 
                disabled={!product.availabilityStatus}
                className="border-[#ee4d2d] text-[#ee4d2d] bg-[#ffeee8] hover:bg-[#ffeee8]/80 hover:text-[#ee4d2d] h-12 px-6 rounded-sm gap-2 font-medium"
              >
                <ShoppingCart className="w-5 h-5 fill-current" />
                Thêm vào giỏ hàng
              </Button>
              <Button 
                onClick={() => {
                  handleAddToCart();
                  router.push("/cart");
                }} 
                disabled={!product.availabilityStatus}
                className="bg-[#ee4d2d] hover:bg-[#d03d20] text-white h-12 px-8 rounded-sm font-medium"
              >
                Mua ngay
              </Button>
            </div>
          </div>
        </div>

        {/* Shop Information Section (Shopee-style) */}
        <div className="bg-white border rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          {/* Shop profile details */}
          <div className="flex items-center space-x-4 border-r-0 md:border-r pr-0 md:pr-8 border-gray-100 flex-1">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-orange-100 border border-orange-200 overflow-hidden flex items-center justify-center">
                <img src={getAvatarUrl(product.shopImageUrl, DEFAULT_SHOP_AVATAR)} alt={product.shopName || "Cửa hàng"} className="w-full h-full object-cover" />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                {product.shopName || "Cửa hàng thú cưng"}
              </h3>
              <p className="text-xs text-gray-500 mb-3">Hoạt động 5 phút trước</p>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 gap-1.5" onClick={() => router.push(`/chat?new=${product.shopId}`)}>
                  <MessageCircle className="w-4 h-4" /> Nhắn tin ngay
                </Button>
                <Button size="sm" variant="ghost" className="bg-gray-50 hover:bg-gray-100 text-gray-700 gap-1.5" onClick={() => router.push(`/shop?shopId=${product.shopId}`)}>
                  <Store className="w-4 h-4" /> Xem cửa hàng
                </Button>
              </div>
            </div>
          </div>

          {/* Shop stats details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 flex-[1.5] text-sm text-gray-600">
            <div>
              <p className="text-gray-400">Đánh giá</p>
              <p className="font-semibold text-orange-500 text-base">4.9 (420 đánh giá)</p>
            </div>
            <div>
              <p className="text-gray-400 font-normal">Sản phẩm</p>
              <p className="font-semibold text-gray-900 text-base">25 sản phẩm</p>
            </div>
            <div>
              <p className="text-gray-400 font-normal">Tỷ lệ phản hồi</p>
              <p className="font-semibold text-gray-900 text-base">97% (Trong vài giờ)</p>
            </div>
            <div>
              <p className="text-gray-400 font-normal">Tham gia</p>
              <p className="font-semibold text-gray-900 text-base">6 tháng trước</p>
            </div>
            <div>
              <p className="text-gray-400 font-normal">Người theo dõi</p>
              <p className="font-semibold text-gray-900 text-base">1.2k người theo dõi</p>
            </div>
          </div>
        </div>

        {/* Product Details & Description Section (Shopee Image 2 Style) */}
        <div className="bg-white rounded-sm p-6 shadow-sm mb-6">
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider bg-gray-50/70 p-3 mb-6">
            Chi tiết sản phẩm
          </h2>
          <div className="space-y-4 text-sm max-w-3xl px-3 mb-8">
            <div className="flex py-2.5 border-b border-gray-100">
              <span className="w-48 text-gray-400 shrink-0">Danh mục</span>
              <div className="flex items-center space-x-1.5 text-blue-600 font-medium">
                <Link href="/" className="hover:underline">PetSitter</Link>
                <span>&gt;</span>
                <Link href="/shop" className="hover:underline">Thú cưng</Link>
                <span>&gt;</span>
                <span className="text-gray-800 font-normal">{product.categoryName}</span>
              </div>
            </div>
            <div className="flex py-2.5 border-b border-gray-100">
              <span className="w-48 text-gray-400 shrink-0">Kho hàng</span>
              <span className="text-gray-800 font-medium">Còn hàng</span>
            </div>
            <div className="flex py-2.5 border-b border-gray-100">
              <span className="w-48 text-gray-400 shrink-0">Xuất xứ</span>
              <span className="text-gray-800">Trong nước</span>
            </div>
            <div className="flex py-2.5 border-b border-gray-100">
              <span className="w-48 text-gray-400 shrink-0">Thương hiệu</span>
              <span className="text-gray-800 font-medium">{product.brandName}</span>
            </div>
            <div className="flex py-2.5 border-b border-gray-100">
              <span className="w-48 text-gray-400 shrink-0">Gửi từ</span>
              <span className="text-gray-800 font-medium">Hà Nội</span>
            </div>
          </div>

          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider bg-gray-50/70 p-3 mb-6">
            Mô tả sản phẩm
          </h2>
          <div className="px-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="bg-white rounded-sm p-6 shadow-sm mb-6">
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider bg-gray-50/70 p-3 mb-6">
            Đánh giá sản phẩm ({reviews.length})
          </h2>
          
          <div className="px-3">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <p className="text-gray-500 text-sm">Chưa có đánh giá nào cho sản phẩm này.</p>
                <Button onClick={() => setOpen(true)} className="bg-[#ee4d2d] hover:bg-[#d03d20] text-white">Viết đánh giá</Button>
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-gray-100">
                {reviews.map((review) => (
                  <div key={review.reviewId} className="flex items-start gap-4 pt-4 first:pt-0">
                    <img
                      src={getAvatarUrl(review.users?.profilePictureUrl)}
                      alt={review.users?.fullName || "Ẩn danh"}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{review.users?.fullName || "Người dùng ẩn danh"}</p>
                          <div className="flex mt-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-gray-800 leading-relaxed bg-gray-50/50 p-3 rounded-sm">{review.comment}</p>
                    </div>
                  </div>
                ))}

                <div className="flex justify-center pt-6">
                  <Button onClick={() => setOpen(true)} className="bg-[#ee4d2d] hover:bg-[#d03d20] text-white rounded-sm px-6">
                    Viết đánh giá của bạn
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Write Review Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Đánh giá sản phẩm</DialogTitle>
              </DialogHeader>

              {/* Rating */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Chọn mức điểm:</p>
                <div className="flex space-x-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-8 h-8 cursor-pointer transition-colors ${
                        i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
                      }`}
                      onClick={() => setRating(i + 1)}
                    />
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2 mt-4">
                <p className="text-sm font-semibold text-gray-700">Nhận xét:</p>
                <Textarea
                  placeholder="Chia sẻ suy nghĩ của bạn về sản phẩm này..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <DialogFooter className="mt-6">
                <Button onClick={() => setOpen(false)} variant="outline">Hủy</Button>
                <Button onClick={handleSubmitReview} className="bg-[#ee4d2d] hover:bg-[#d03d20] text-white">Gửi đánh giá</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 bg-white rounded-sm p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider bg-gray-50/70 p-3 mb-6">Sản phẩm tương tự</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-3">
              {relatedProducts.map((relatedProduct) => (
                <div 
                  key={relatedProduct.productId} 
                  className="hover:shadow-md transition-shadow border border-gray-100 rounded-sm overflow-hidden flex flex-col justify-between cursor-pointer"
                  onClick={() => router.push(`/shop/product/${relatedProduct.productId}`)}
                >
                  <div>
                    <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                      <img
                        src={relatedProduct.productImageUrl || "/placeholder.svg"}
                        alt={relatedProduct.productName}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-xs text-gray-800 line-clamp-2 h-8 mb-2 leading-relaxed">
                        {relatedProduct.productName}
                      </h3>
                    </div>
                  </div>
                  <div className="p-3 pt-0 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#ee4d2d]">
                      {new Intl.NumberFormat("vi-VN").format(relatedProduct.price)} đ
                    </span>
                    <span className="text-[10px] text-gray-400">Đã bán 100+</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
