"use client";

import type React from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { getVariantOptions } from "@/lib/variants";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const reviewCount = product.reviews?.length ?? 0;
  const averageRating =
    reviewCount > 0 ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : product.rating ?? 0;

  const cacheProductForDetail = () => {
    try {
      sessionStorage.setItem(`product:${product.productId}`, JSON.stringify(product));
    } catch {
      // Browsers can block storage; navigation should still work normally.
    }
  };

  const toggleFavorite = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      router.push("/login");
      return;
    }
    const defaultVariant = getVariantOptions(product.productName, product.categoryName)[0] || "Tiêu chuẩn";
    addToCart(product, 1, defaultVariant);
    toast.success(`${product.productName} (${defaultVariant}) đã được thêm vào giỏ hàng!`);
  };

  return (
    <Link href={`/shop/product/${product.productId}`} className="block h-full" onClick={cacheProductForDetail}>
      <Card className="group h-full cursor-pointer gap-0 overflow-hidden py-0 transition duration-300 hover:-translate-y-0.5 hover:border-[#bfd1c8] hover:shadow-[0_18px_46px_rgba(22,49,42,0.14)]">
        <CardContent className="flex h-full flex-col p-0">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#eef3ee]">
            <Image
              src={product.productImageUrl || "/placeholder.svg"}
              alt={product.productName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Lưu ${product.productName}`}
              className="absolute right-3 top-3 size-9 border border-white/80 bg-white/88 text-[#526761] shadow-sm backdrop-blur hover:bg-white hover:text-[#b44735]"
              onClick={toggleFavorite}
            >
              <Heart className="size-4" />
            </Button>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-[#16312a]">{product.productName}</h3>

            <div className="mb-5 flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`size-3 ${
                      index < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-[#687d76]">{averageRating.toFixed(1)}</span>
              {reviewCount > 0 && <span className="ml-2 text-sm text-[#8a9a94]">({reviewCount})</span>}
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-[#e0e8e2] pt-4">
              <span className="text-xl font-semibold text-[#16312a]">
                {new Intl.NumberFormat("vi-VN").format(product.price)} đ
              </span>
              <Button
                type="button"
                size="icon"
                aria-label={`Thêm ${product.productName} vào giỏ hàng`}
                className="size-9 bg-[#b44735] text-white hover:bg-[#9c3828]"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
