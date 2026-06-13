"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export default function PaymentSuccessPage() {
  const { removeItemsFromCart, clearCart, checkoutStorageKey } = useCart();

  useEffect(() => {
    const storedItems = localStorage.getItem(checkoutStorageKey);

    if (storedItems) {
      try {
        const checkoutItems = JSON.parse(storedItems) as Array<{ productId: string }>;
        removeItemsFromCart(checkoutItems.map((item) => item.productId));
      } catch {
        clearCart();
      }

      localStorage.removeItem(checkoutStorageKey);
      return;
    }

    clearCart();
  }, [checkoutStorageKey, clearCart, removeItemsFromCart]);

  return (
    <>
      <Navigation />
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-green-500" />
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Thanh toán thành công!</h1>
        <p className="mb-8 text-gray-600">
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/shop">Tiếp tục mua sắm</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/orders">Xem đơn hàng của tôi</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </>
  );
}
