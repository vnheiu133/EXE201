// app/payment/cancel/page.tsx
"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

export default function PaymentCancelPage() {
  useEffect(() => {
    localStorage.removeItem("checkoutCartItems");
  }, []);

  return (
    <>
      <Navigation />
      <div className="container mx-auto max-w-2xl text-center py-20 px-4">
        <XCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thanh toán đã bị hủy
        </h1>
        <p className="text-gray-600 mb-8">
          Thanh toán chưa hoàn tất. Giỏ hàng của bạn đã được lưu và bạn có thể thanh toán lại bất cứ lúc nào.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/cart">Quay lại giỏ hàng</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/shop">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </>
  );
}
