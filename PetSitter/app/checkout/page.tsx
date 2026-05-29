// app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { CartItem, useCart } from "@/contexts/cart-context"; 
import { useAuth } from "@/contexts/auth-context"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation"; 
import { Footer } from "@/components/footer"; 

export default function CheckoutPage() {
  const { cart } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();
  
  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [hasLoadedCheckoutItems, setHasLoadedCheckoutItems] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedItems = localStorage.getItem("checkoutCartItems");
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems) as CartItem[];
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          setCheckoutItems(parsedItems);
          setHasLoadedCheckoutItems(true);
          return;
        }
      } catch {
        localStorage.removeItem("checkoutCartItems");
      }
    }

    setCheckoutItems(cart);
    setHasLoadedCheckoutItems(true);
  }, [cart]);

  const total = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt hàng.");
      router.push("/login");
      return;
    }
    if (!shippingAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng.");
      return;
    }
    if (!token) { // <-- Thêm kiểm tra token
        toast.error("Không tìm thấy mã xác thực. Vui lòng đăng nhập lại.");
        router.push("/login");
        return;
    }

    setIsLoading(true);

    const checkoutData = {
      fullName: user.fullName, 
      phoneNumber: user.phoneNumber,
      shippingAddress: shippingAddress,
      cartItems: checkoutItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    // app/checkout/page.tsx -> trong hàm handlePlaceOrder

try {
  const response = await fetch("http://localhost:5278/api/orders/checkout", { 
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(checkoutData),
  });

  // KIỂM TRA LỖI 401 UNAUTHORIZED
  if (response.status === 401) {
    toast.error("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.");
    // Điều hướng người dùng về trang đăng nhập
    router.push('/login'); 
    return; // Dừng hàm tại đây
  }
  
  if (!response.ok) {
    // Thử đọc lỗi dưới dạng text trước
    const errorText = await response.text(); 
    throw new Error(errorText || "Đặt hàng thất bại.");
  }
  
  // Chỉ parse JSON nếu có nội dung
  const contentLength = response.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 0) {
    const data = await response.json();
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else {
      throw new Error("Không nhận được liên kết thanh toán.");
    }
  } else {
    // Xử lý trường hợp response thành công nhưng không có nội dung
    throw new Error("Nhận phản hồi trống từ máy chủ.");
  }

} catch (error: any) {
  toast.error(error.message);
} finally {
  setIsLoading(false);
}
  };

  // Nếu giỏ hàng trống thì điều hướng về shop
  if (hasLoadedCheckoutItems && checkoutItems.length === 0 && typeof window !== 'undefined') {
    router.replace('/cart');
    return null;
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Thanh toán</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Cột thông tin giao hàng */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Thông tin giao hàng</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Địa chỉ giao hàng</Label>
                <Input 
                  id="address" 
                  placeholder="Nhập địa chỉ giao hàng của bạn..." 
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="mt-1"
                />
              </div>
              {/* Thêm các trường khác nếu cần: Full Name, Phone... */}
            </div>
          </div>

          {/* Cột tóm tắt đơn hàng */}
          <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-4">Đơn hàng của bạn</h2>
            <div className="space-y-2 mb-4 border-b pb-4">
              {checkoutItems.map(item => (
                <div key={item.productId} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <img src={item.productImageUrl} alt={item.productName} className="w-10 h-10 object-cover rounded mr-3"/>
                    <span>{item.productName} <span className="text-gray-500">x {item.quantity}</span></span>
                  </div>
                  <span>{new Intl.NumberFormat("vi-VN").format(item.price * item.quantity)} đ</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng</span>
              <span>{new Intl.NumberFormat("vi-VN").format(total)} đ</span>
            </div>
            <Button 
              className="w-full mt-6"
              onClick={handlePlaceOrder}
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đặt hàng & Thanh toán bằng PayOS"}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
