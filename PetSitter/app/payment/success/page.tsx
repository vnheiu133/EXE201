// app/payment/success/page.tsx
"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '@/contexts/cart-context'; 
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

export default function PaymentSuccessPage() {
  const { clearCart } = useCart(); // Lấy hàm xóa giỏ hàng từ context

  // Tự động xóa giỏ hàng khi người dùng truy cập trang này
  useEffect(() => {
    clearCart();
    localStorage.removeItem("checkoutCartItems");
  }, [clearCart]);

  return (
    <>
      <Navigation />
      <div className="container mx-auto max-w-2xl text-center py-20 px-4">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order is being processed and you will receive a confirmation email shortly.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/orders">View My Orders</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </>
  );
}
