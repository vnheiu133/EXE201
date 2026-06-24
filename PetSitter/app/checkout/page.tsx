"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartItem, useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useStates } from "@/components/api/location";

const currency = new Intl.NumberFormat("vi-VN");
type PaymentMethod = "PayOS" | "COD";

const getCheckoutStorageKeys = (checkoutStorageKey: string) =>
  Array.from(new Set([checkoutStorageKey, "checkoutCartItems"]));

const readStoredCheckoutItems = (keys: string[]) => {
  for (const key of keys) {
    const storedItems = localStorage.getItem(key);
    if (!storedItems) continue;

    try {
      const parsedItems = JSON.parse(storedItems) as CartItem[];
      if (Array.isArray(parsedItems) && parsedItems.length > 0) {
        return parsedItems;
      }
    } catch {
      localStorage.removeItem(key);
    }
  }

  return null;
};

export default function CheckoutPage() {
  const { cart, hasLoadedCart, removeItemsFromCart, checkoutStorageKey } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();
  const { states } = useStates("VN");

  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PayOS");
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [hasLoadedCheckoutItems, setHasLoadedCheckoutItems] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedItems = readStoredCheckoutItems(getCheckoutStorageKeys(checkoutStorageKey));
    if (storedItems) {
      setCheckoutItems(storedItems);
      setHasLoadedCheckoutItems(true);
      return;
    }

    if (!hasLoadedCart) {
      return;
    }

    setCheckoutItems(cart);
    setHasLoadedCheckoutItems(true);
  }, [cart, checkoutStorageKey, hasLoadedCart]);

  useEffect(() => {
    setShippingAddress((current) => current || user?.address || "");
    setPhoneNumber((current) => current || user?.phoneNumber || "");
  }, [user]);

  useEffect(() => {
    if (hasLoadedCheckoutItems && checkoutItems.length === 0) {
      router.replace("/cart");
    }
  }, [checkoutItems.length, hasLoadedCheckoutItems, router]);

  const total = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addressSuggestions = useMemo(() => {
    const suggestions = [user?.address, ...states.map((state) => `${state.name}, Việt Nam`)].filter(
      (value): value is string => Boolean(value?.trim()),
    );

    return Array.from(new Set(suggestions));
  }, [states, user?.address]);

  const finishLocalOrder = () => {
    removeItemsFromCart(checkoutItems.map((item) => item.selectedVariant ? `${item.productId}_${item.selectedVariant}` : String(item.productId)));
    getCheckoutStorageKeys(checkoutStorageKey).forEach((key) => localStorage.removeItem(key));
    toast.success("Đặt hàng thành công. Bạn sẽ thanh toán khi nhận hàng.");
    router.push("/orders");
  };

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

    if (!token) {
      toast.error("Không tìm thấy mã xác thực. Vui lòng đăng nhập lại.");
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: user.fullName,
          phoneNumber: phoneNumber.trim() || "0901135618",
          shippingAddress: shippingAddress.trim(),
          paymentMethod,
          cartItems: checkoutItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            selectedVariant: item.selectedVariant,
          })),
        }),
      });

      if (response.status === 401) {
        toast.error("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.");
        router.push("/login");
        return;
      }

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : null;

      if (!response.ok) {
        throw new Error(data?.message || data?.Message || "Đặt hàng thất bại.");
      }

      if (paymentMethod === "COD" || data?.paymentMethod === "COD") {
        finishLocalOrder();
        return;
      }

      const checkoutUrl = data?.checkoutUrl || data?.checkoutURL || data?.data?.checkoutUrl || data?.data?.checkoutURL;
      if (!checkoutUrl) {
        throw new Error("Không nhận được liên kết thanh toán PayOS.");
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đặt hàng thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (hasLoadedCheckoutItems && checkoutItems.length === 0) {
    return null;
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <h1 className="mb-8 text-center text-3xl font-bold text-[#16312a]">Thanh toán</h1>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_24rem]">
          <div className="space-y-6">
            <section className="rounded-lg border border-[#dce6df] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-[#16312a]">Thông tin giao hàng</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Địa chỉ giao hàng</Label>
                  <Input
                    id="address"
                    list="shipping-address-suggestions"
                    placeholder="Nhập địa chỉ giao hàng của bạn"
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                    className="mt-1"
                  />
                  <datalist id="shipping-address-suggestions">
                    {addressSuggestions.map((suggestion) => (
                      <option key={suggestion} value={suggestion} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="Nhập số điện thoại của bạn"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[#dce6df] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-[#16312a]">Phương thức thanh toán</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("PayOS")}
                  className={`flex min-h-24 items-start gap-3 rounded-md border p-4 text-left transition ${
                    paymentMethod === "PayOS"
                      ? "border-[#a23820] bg-[#fff5ee] text-[#16312a]"
                      : "border-[#dce6df] bg-white text-[#526761] hover:border-[#b44735]"
                  }`}
                >
                  <CreditCard className="mt-0.5 size-5 shrink-0 text-[#b44735]" />
                  <span>
                    <span className="block font-semibold">Thanh toán PayOS</span>
                    <span className="mt-1 block text-sm text-[#687d76]">Chuyển sang cổng thanh toán online.</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex min-h-24 items-start gap-3 rounded-md border p-4 text-left transition ${
                    paymentMethod === "COD"
                      ? "border-[#a23820] bg-[#fff5ee] text-[#16312a]"
                      : "border-[#dce6df] bg-white text-[#526761] hover:border-[#b44735]"
                  }`}
                >
                  <Banknote className="mt-0.5 size-5 shrink-0 text-[#b44735]" />
                  <span>
                    <span className="block font-semibold">Thanh toán khi nhận hàng</span>
                    <span className="mt-1 block text-sm text-[#687d76]">Đặt đơn ngay và trả tiền khi shipper giao hàng.</span>
                  </span>
                </button>
              </div>
            </section>
          </div>

          <section className="h-fit rounded-lg border border-[#dce6df] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-[#16312a]">Đơn hàng của bạn</h2>
            <div className="mb-4 space-y-3 border-b border-[#e0e8e2] pb-4">
              {checkoutItems.map((item) => (
                <div key={`${item.productId}_${item.selectedVariant || ""}`} className="flex flex-col gap-1 border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-center">
                      <img
                        src={item.productImageUrl || "/placeholder.svg"}
                        alt={item.productName}
                        className="mr-3 h-10 w-10 shrink-0 rounded object-cover"
                      />
                      <span className="min-w-0 truncate font-medium">
                        {item.productName} <span className="text-gray-500">x {item.quantity}</span>
                      </span>
                    </div>
                    <span className="shrink-0 font-medium">{currency.format(item.price * item.quantity)} đ</span>
                  </div>
                  {item.selectedVariant && (
                    <p className="ml-13 text-xs text-[#a23820] font-semibold bg-[#a23820]/5 px-2 py-0.5 rounded-sm w-fit border border-[#a23820]/10">
                      Phân loại: {item.selectedVariant}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-lg font-bold text-[#16312a]">
              <span>Tổng cộng</span>
              <span>{currency.format(total)} đ</span>
            </div>
            <Button className="mt-6 w-full bg-[#a23820] hover:bg-[#8e2e1a]" onClick={handlePlaceOrder} disabled={isLoading}>
              {isLoading
                ? "Đang xử lý..."
                : paymentMethod === "COD"
                  ? "Đặt hàng thanh toán khi nhận hàng"
                  : "Đặt hàng và thanh toán PayOS"}
            </Button>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
