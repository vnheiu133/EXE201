"use client";

import { useEffect, useState, useMemo } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Store, MessageCircle, Loader2, Calendar } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  itemId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  variant?: string;
}

interface OrderGroup {
  orderId?: string;
  shopId: string;
  shopName: string;
  totalAmount: number;
  items: OrderItem[];
  status: "shipping" | "pending" | "completed" | "cancelled" | "refund";
  statusText: string;
  shippingProgressText?: string;
  expectedDelivery: string;
  shippingAddress?: string;
  isMall?: boolean;
}

export default function OrdersPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [orders, setOrders] = useState<OrderGroup[]>([]);

  // 1. Mock orders matching the user's Shopee screenshot exactly
  const mockOrders: OrderGroup[] = [
    {
      shopId: "shop-kim-dong-id",
      shopName: "NHÀ XUẤT BẢN KIM ĐỒNG",
      isMall: true,
      status: "shipping",
      statusText: "ĐANG VẬN CHUYỂN",
      shippingProgressText: "Người bán đang chuẩn bị hàng",
      expectedDelivery: "Dự kiến nhận hàng 29-05-2026 - 30-05-2026",
      totalAmount: 12800, // Matching 12.800đ from screenshot
      items: [
        {
          itemId: "item-1",
          productId: "prod-1",
          productName: "Truyện tranh - Vòng lặp lần thứ 7",
          productImage: "https://res.cloudinary.com/dmri47mzp/image/upload/v1779258589/premium_cat_food_1779258589761.png", // fallback or any image
          quantity: 1,
          price: 50000,
          variant: "Tập 6 kèm thẻ Shikishi",
        }
      ]
    },
    {
      shopId: "shop-nxb-tre-id",
      shopName: "CHS NXB Trẻ 157",
      isMall: true,
      status: "shipping",
      statusText: "ĐANG VẬN CHUYỂN",
      expectedDelivery: "Dự kiến nhận hàng 19-05-2026 - 21-05-2026",
      totalAmount: 151312, // Matching 151.312đ from screenshot
      items: [
        {
          itemId: "item-2",
          productId: "prod-2",
          productName: "Truyện tranh - Hananoi-kun và bệnh tương tư - Tập 20",
          productImage: "https://res.cloudinary.com/dmri47mzp/image/upload/v1779258611/organic_dog_food_1779258611554.png", // fallback
          quantity: 1,
          price: 189140,
          originalPrice: 193000,
          variant: "Combo bản thường + bản đặc biệt",
        }
      ]
    },
    {
      shopId: "default-shop",
      shopName: "Cửa hàng thú cưng",
      isMall: false,
      status: "completed",
      statusText: "ĐÃ HOÀN THÀNH",
      expectedDelivery: "Giao hàng thành công vào 15-05-2026",
      totalAmount: 220000,
      items: [
        {
          itemId: "item-3",
          productId: "prod-3",
          productName: "Đồ chơi xương gặm siêu bền cho chó",
          productImage: "https://res.cloudinary.com/dmri47mzp/image/upload/v1779258644/dog_chew_toy_1779258644319.png",
          quantity: 2,
          price: 110000,
          variant: "Màu cam",
        }
      ]
    }
  ];

  useEffect(() => {
    if (!user && !localStorage.getItem("token")) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const storedToken = token || localStorage.getItem("token");
        const res = await fetch("/api/orders/getallorders", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const apiData = await res.json();
          // Map apiData to our format
          const mappedOrders = apiData.map((order: any) => {
            const normalizedStatus = String(order.status || "").toLowerCase();
            const status: OrderGroup["status"] =
              normalizedStatus === "completed"
                ? "completed"
                : normalizedStatus === "cancelled"
                  ? "cancelled"
                  : "pending";

            return {
            orderId: order.orderId,
            shopId: order.shopId,
            shopName: order.shopName,
            isMall: true,
            status,
            statusText: "ĐANG VẬN CHUYỂN",
            expectedDelivery: "Dự kiến nhận hàng sau 3 ngày",
            totalAmount: order.totalAmount,
            items: order.items.map((item: any) => ({
              itemId: item.itemId,
              productId: item.productId,
              productName: item.productName,
              productImage: item.productImage || "/placeholder.svg",
              quantity: item.quantity,
              price: item.price,
              variant: "Tiêu chuẩn",
            })),
            };
          });

          // Merge API orders with our gorgeous mock orders for demonstration
          setOrders(mappedOrders);
        } else {
          // If no orders or failed, fall back to showcase mock orders
          setOrders([]);
        }
      } catch (err) {
        console.warn("Không tải được đơn hàng từ API, đang dùng dữ liệu mẫu.", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, user]);

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chờ thanh toán" },
    { id: "shipping", label: "Chờ vận chuyển", badge: 2 },
    { id: "delivery", label: "Đang giao" },
    { id: "completed", label: "Hoàn thành" },
    { id: "cancelled", label: "Đã hủy" },
    { id: "refund", label: "Trả hàng/Hoàn tiền" },
  ];

  // Filter orders by active tab status
  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    if (activeTab === "shipping") return orders.filter(o => o.status === "shipping");
    if (activeTab === "pending") return orders.filter(o => o.status === "pending");
    if (activeTab === "completed") return orders.filter(o => o.status === "completed");
    if (activeTab === "cancelled") return orders.filter(o => o.status === "cancelled");
    if (activeTab === "refund") return orders.filter(o => o.status === "refund");
    return orders;
  }, [orders, activeTab]);

  const handleCancelOrder = (shopName: string) => {
    toast.success(`Yêu cầu hủy đơn hàng tại ${shopName} đã được gửi thành công!`);
  };

  const handleContactShop = (shopId: string) => {
    router.push(`/chat?new=${shopId}`);
  };

  const getStatusTextVi = (status: string, statusText: string) => {
    const lower = (status || statusText || "").toLowerCase();
    if (lower === "shipping") return "ĐANG VẬN CHUYỂN";
    if (lower === "pending") return "CHỜ THANH TOÁN";
    if (lower === "completed") return "ĐÃ HOÀN THÀNH";
    if (lower === "cancelled") return "ĐÃ HỦY";
    if (lower === "refund") return "TRẢ HÀNG/HOÀN TIỀN";
    return statusText || status;
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#f5f5f5] pb-16">
        {/* Tab Headers matching Shopee style */}
        <div className="bg-white border-b shadow-sm sticky top-16 z-40">
          <div className="max-w-4xl mx-auto flex overflow-x-auto scrollbar-hide justify-between md:justify-around">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-4 text-sm font-medium transition-colors relative whitespace-nowrap outline-none ${
                    isSelected ? "text-[#ee4d2d]" : "text-gray-600 hover:text-[#ee4d2d]"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {tab.label}
                    {tab.badge && (
                      <span className="bg-[#ee4d2d] text-white text-xs px-1.5 py-0.5 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#ee4d2d]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content body */}
        <div className="max-w-4xl mx-auto px-4 mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#ee4d2d] animate-spin" />
              <p className="text-gray-500 mt-4 text-sm">Đang tải đơn hàng...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-16 text-center flex flex-col items-center justify-center">
              <img
                src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/5fafbb923393b712b96488590b8f781f.png"
                alt="empty-orders"
                className="w-24 h-24 mb-4 object-contain"
              />
              <h3 className="text-gray-800 font-semibold text-lg mb-2">Chưa có đơn hàng nào</h3>
              <p className="text-gray-500 text-sm mb-6">Bạn chưa có đơn hàng nào trong trạng thái này</p>
              <Button asChild className="bg-[#ee4d2d] hover:bg-[#ee4d2d]/90">
                <Link href="/shop">Mua sắm ngay</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order, index) => (
                <div key={`${order.shopId}-${index}`} className="bg-white rounded shadow-sm border overflow-hidden">
                  
                  {/* Order Card Header (Shop Info & Status) */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3">
                    <div className="flex items-center space-x-2.5">
                      {order.isMall && (
                        <span className="bg-[#d0011b] text-white text-[10px] font-extrabold px-1 rounded uppercase tracking-wider">
                          Chính hãng
                        </span>
                      )}
                      <span className="font-bold text-gray-900 text-sm">{order.shopName}</span>
                      
                      <Button
                        size="sm"
                        onClick={() => handleContactShop(order.shopId)}
                        className="bg-[#ee4d2d] text-white hover:bg-[#d03d20] h-6 px-2.5 text-xs rounded-sm gap-1 ml-2"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        Nhắn tin
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/shop?shopId=${order.shopId}`)}
                        className="border-gray-200 text-gray-600 hover:bg-gray-50 h-6 px-2.5 text-xs rounded-sm gap-1"
                      >
                        <Store className="w-3.5 h-3.5" />
                        Xem Cửa hàng
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      {order.shippingProgressText && (
                        <div className="flex items-center text-green-600 font-medium">
                          <img 
                            src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/c5352c3c62934a4c6a65529f7cf7c6c4.png" 
                            alt="" 
                            className="w-4 h-4 mr-1.5 object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <span>{order.shippingProgressText}</span>
                          <span className="text-gray-300 mx-2">|</span>
                        </div>
                      )}
                      <span className="text-[#ee4d2d] font-bold tracking-wider uppercase">
                        {getStatusTextVi(order.status, order.statusText)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="divide-y divide-gray-100">
                    {order.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex p-6 items-start">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-20 h-20 object-cover border rounded mr-4 bg-gray-50"
                        />
                        <div className="flex-grow">
                          <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                            {item.productName}
                          </h4>
                          {item.variant && (
                            <p className="text-xs text-gray-500 mt-2 bg-gray-50 inline-block px-2 py-1 rounded">
                              Phân loại: {item.variant}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">x{item.quantity}</p>
                        </div>
                        <div className="text-right flex flex-col justify-center h-full min-w-[100px]">
                          {item.originalPrice && (
                            <span className="text-xs text-gray-400 line-through mr-1">
                              {new Intl.NumberFormat("vi-VN").format(item.originalPrice)} đ
                            </span>
                          )}
                          <span className="text-sm font-semibold text-[#ee4d2d]">
                            {new Intl.NumberFormat("vi-VN").format(item.price)} đ
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expected Delivery Date Block */}
                  <div className="bg-[#fffcf5] border-t border-b border-orange-100 px-6 py-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-orange-800">{order.expectedDelivery}</span>
                  </div>

                  {/* Order Card Footer */}
                  <div className="px-6 py-5 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-xs text-gray-500">Tổng số tiền:</span>
                      <span className="text-2xl font-bold text-[#ee4d2d]">
                        {new Intl.NumberFormat("vi-VN").format(order.totalAmount)} đ
                      </span>
                    </div>

                    <div className="flex space-x-3 w-full sm:w-auto justify-end">
                      <Button
                        onClick={() => handleCancelOrder(order.shopName)}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-sm py-2 px-5"
                      >
                        Hủy đơn hàng
                      </Button>
                      <Button
                        onClick={() => handleContactShop(order.shopId)}
                        className="bg-[#ee4d2d] hover:bg-[#d03d20] text-white text-sm font-medium rounded-sm py-2 px-5"
                      >
                        Liên hệ Người bán
                      </Button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
