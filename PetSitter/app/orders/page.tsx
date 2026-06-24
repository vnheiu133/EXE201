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

interface BookingItem {
  bookingId: string;
  bookingDate: string;
  status: number;
  totalPrice: number;
  note?: string;
  createdAt: string;
  service: {
    serviceId: string;
    serviceName: string;
    serviceImageUrl: string;
    description: string;
    shop: {
      shopId: string;
      shopName: string;
      shopImageUrl: string;
    }
  };
  pet: {
    petId: string;
    petName: string;
    petType: string;
  }
}

export default function OrdersPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [orders, setOrders] = useState<OrderGroup[]>([]);
  const [viewMode, setViewMode] = useState<"products" | "services">("products");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "bookings") {
        setViewMode("services");
      }
    }
  }, []);

  // Fetch product orders
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
                variant: item.selectedVariant || "Tiêu chuẩn",
              })),
            };
          });

          setOrders(mappedOrders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.warn("Không tải được đơn hàng từ API.", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, user, router]);

  // Fetch service bookings
  useEffect(() => {
    if (!user) return;
    
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const storedToken = token || localStorage.getItem("token");
        const res = await fetch("/api/booking/my-bookings", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      } catch (err) {
        console.warn("Không tải được lịch đặt từ API.", err);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [token, user]);

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chờ xác nhận" },
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

  // Filter bookings by active tab status (0: Pending, 1: Confirmed, 2: Completed, 3: Cancelled)
  const filteredBookings = useMemo(() => {
    if (activeTab === "all") return bookings;
    if (activeTab === "pending") return bookings.filter(b => b.status === 0);
    if (activeTab === "completed") return bookings.filter(b => b.status === 2);
    if (activeTab === "cancelled") return bookings.filter(b => b.status === 3);
    return [];
  }, [bookings, activeTab]);

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
        
        {/* Toggle Switcher */}
        <div className="bg-white border-b py-3 sticky top-16 z-50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 flex justify-center gap-4">
            <button
              onClick={() => {
                setViewMode("products");
                setActiveTab("all");
              }}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                viewMode === "products"
                  ? "bg-[#ee4d2d] text-white shadow-md shadow-[#ee4d2d]/25"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Đơn hàng Sản phẩm
            </button>
            <button
              onClick={() => {
                setViewMode("services");
                setActiveTab("all");
              }}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                viewMode === "services"
                  ? "bg-[#ee4d2d] text-white shadow-md shadow-[#ee4d2d]/25"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Lịch đặt Dịch vụ
            </button>
          </div>
        </div>

        {/* Tab Headers matching Shopee style */}
        <div className="bg-white border-b shadow-sm sticky top-28 z-40">
          <div className="max-w-4xl mx-auto flex overflow-x-auto scrollbar-hide justify-between md:justify-around">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              // For services view, we only support: Tất cả, Chờ xác nhận (pending), Hoàn thành (completed), Đã hủy (cancelled)
              if (viewMode === "services" && tab.id !== "all" && tab.id !== "pending" && tab.id !== "completed" && tab.id !== "cancelled") {
                return null;
              }
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
                    {tab.badge && viewMode === "products" && (
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
          {viewMode === "products" ? (
            loading ? (
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
                  <div key={`${order.orderId || index}`} className="bg-white rounded shadow-sm border overflow-hidden">
                    
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
            )
          ) : (
            loadingBookings ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#ee4d2d] animate-spin" />
                <p className="text-gray-500 mt-4 text-sm">Đang tải lịch hẹn...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-16 text-center flex flex-col items-center justify-center">
                <img
                  src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/5fafbb923393b712b96488590b8f781f.png"
                  alt="empty-bookings"
                  className="w-24 h-24 mb-4 object-contain"
                />
                <h3 className="text-gray-800 font-semibold text-lg mb-2">Chưa có lịch hẹn nào</h3>
                <p className="text-gray-500 text-sm mb-6">Bạn chưa có lịch hẹn dịch vụ nào trong trạng thái này</p>
                <Button asChild className="bg-[#ee4d2d] hover:bg-[#ee4d2d]/90">
                  <Link href="/features">Đặt lịch dịch vụ ngay</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div key={booking.bookingId} className="bg-white rounded shadow-sm border overflow-hidden">
                    
                    {/* Booking Card Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold text-gray-900 text-sm">
                          {booking.service.shop.shopName}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleContactShop(booking.service.shop.shopId)}
                          className="bg-[#ee4d2d] text-white hover:bg-[#d03d20] h-6 px-2.5 text-xs rounded-sm gap-1 ml-2"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current" />
                          Nhắn tin
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/shop?shopId=${booking.service.shop.shopId}`)}
                          className="border-gray-200 text-gray-600 hover:bg-gray-50 h-6 px-2.5 text-xs rounded-sm gap-1"
                        >
                          <Store className="w-3.5 h-3.5" />
                          Xem Cửa hàng
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        <span className={`font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                          booking.status === 0 ? "bg-amber-100 text-amber-700" :
                          booking.status === 1 ? "bg-blue-100 text-blue-700" :
                          booking.status === 2 ? "bg-green-100 text-green-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {booking.status === 0 ? "CHỜ XÁC NHẬN" :
                           booking.status === 1 ? "ĐÃ XÁC NHẬN" :
                           booking.status === 2 ? "ĐÃ HOÀN THÀNH" : "ĐÃ HỦY"}
                        </span>
                      </div>
                    </div>

                    {/* Booking Item Detail */}
                    <div className="flex p-6 items-start">
                      <img
                        src={booking.service.serviceImageUrl || "/placeholder.svg"}
                        alt={booking.service.serviceName}
                        className="w-20 h-20 object-cover border rounded mr-4 bg-gray-50"
                      />
                      <div className="flex-grow">
                        <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                          {booking.service.serviceName}
                        </h4>
                        <p className="text-xs text-gray-500 mt-2">
                          Thú cưng: {booking.pet.petName} ({booking.pet.petType})
                        </p>
                        {booking.note && (
                          <p className="text-xs text-gray-400 mt-1 italic">
                            Ghi chú: {booking.note}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex flex-col justify-center h-full min-w-[100px]">
                        <span className="text-sm font-semibold text-[#ee4d2d]">
                          {new Intl.NumberFormat("vi-VN").format(booking.totalPrice)} đ
                        </span>
                      </div>
                    </div>

                    {/* Expected Booking Date Block */}
                    <div className="bg-[#fffcf5] border-t border-b border-orange-100 px-6 py-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span className="text-xs text-orange-800">
                        Thời gian hẹn: {new Date(booking.bookingDate).toLocaleString("vi-VN", {
                          year: "numeric", month: "2-digit", day: "2-digit",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                    </div>

                    {/* Booking Card Footer */}
                    <div className="px-6 py-5 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-xs text-gray-500">Đặt lúc:</span>
                        <span className="text-sm text-gray-700 font-medium">
                          {new Date(booking.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <div className="flex space-x-3 w-full sm:w-auto justify-end">
                        {booking.status === 0 && (
                          <Button
                            onClick={() => {
                              toast.success("Yêu cầu hủy lịch đặt dịch vụ đã được gửi thành công!");
                            }}
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-sm py-2 px-5"
                          >
                            Hủy lịch đặt
                          </Button>
                        )}
                        <Button
                          onClick={() => handleContactShop(booking.service.shop.shopId)}
                          className="bg-[#ee4d2d] hover:bg-[#d03d20] text-white text-sm font-medium rounded-sm py-2 px-5"
                        >
                          Liên hệ Người bán
                        </Button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
