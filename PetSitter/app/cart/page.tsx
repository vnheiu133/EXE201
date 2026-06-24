"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, Minus, Plus, ShoppingCart, Store, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { CartItem, useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { getVariantOptions } from "@/lib/variants"

type CartGroup = {
  shopId: string
  shopName: string
  items: CartItem[]
}

const currency = new Intl.NumberFormat("vi-VN")
const cartItemId = (productId: number | string, selectedVariant?: string) => 
  selectedVariant ? `${productId}_${selectedVariant}` : String(productId)

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, updateVariant, checkoutStorageKey } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    setSelectedIds((current) => {
      const cartIds = cart.map((item) => cartItemId(item.productId, item.selectedVariant))
      if (current.length === 0) return cartIds
      return current.filter((id) => cartIds.includes(id))
    })
  }, [cart])

  const groupedCart = useMemo(() => {
    return cart.reduce<Record<string, CartGroup>>((groups, item) => {
      const shopId = item.shopId || "default-shop"
      const shopName = item.shopName || "Cửa hàng thú cưng"

      if (!groups[shopId]) {
        groups[shopId] = { shopId, shopName, items: [] }
      }

      groups[shopId].items.push(item)
      return groups
    }, {})
  }, [cart])

  const selectedItems = cart.filter((item) => selectedIds.includes(cartItemId(item.productId, item.selectedVariant)))
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const allSelected = cart.length > 0 && selectedIds.length === cart.length

  const setItemSelected = (productId: number | string, selectedVariant: string | undefined, checked: boolean) => {
    const id = cartItemId(productId, selectedVariant)
    setSelectedIds((current) => {
      if (checked) return current.includes(id) ? current : [...current, id]
      return current.filter((currentId) => currentId !== id)
    })
  }

  const setShopSelected = (items: CartItem[], checked: boolean) => {
    const itemIds = items.map((item) => cartItemId(item.productId, item.selectedVariant))
    setSelectedIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...itemIds]))
      }
      return current.filter((id) => !itemIds.includes(id))
    })
  }

  const setAllSelected = (checked: boolean) => {
    setSelectedIds(checked ? cart.map((item) => cartItemId(item.productId, item.selectedVariant)) : [])
  }

  const handleRemove = (item: CartItem) => {
    removeFromCart(item.productId, item.selectedVariant)
    setSelectedIds((current) => current.filter((id) => id !== cartItemId(item.productId, item.selectedVariant)))
    toast.error(`${item.productName} đã được xóa khỏi giỏ hàng.`)
  }

  const handleCheckout = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để tiến hành thanh toán.")
      router.push("/login")
      return
    }

    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán.")
      return
    }

    localStorage.setItem(checkoutStorageKey, JSON.stringify(selectedItems))
    localStorage.setItem("checkoutCartItems", JSON.stringify(selectedItems))
    router.push("/checkout")
  }

  if (cart.length === 0) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="py-16 text-center">
              <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Giỏ hàng của bạn đang trống</h1>
              <p className="mb-8 text-gray-600">Hãy thêm sản phẩm để bắt đầu mua sắm</p>
              <Button asChild>
                <Link href="/shop">Bắt đầu mua sắm</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="hidden grid-cols-[44px_1fr_140px_150px_130px_48px] items-center rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-gray-500 lg:grid">
                <span />
                <span>Sản phẩm</span>
                <span className="text-right">Đơn giá</span>
                <span className="text-center">Số lượng</span>
                <span className="text-right">Thành tiền</span>
                <span />
              </div>

              {Object.values(groupedCart).map((group) => {
                const groupIds = group.items.map((item) => cartItemId(item.productId, item.selectedVariant))
                const checkedCount = groupIds.filter((id) => selectedIds.includes(id)).length
                const shopChecked = checkedCount === group.items.length
                const shopIndeterminate = checkedCount > 0 && checkedCount < group.items.length

                return (
                  <div key={group.shopId} className="overflow-hidden rounded-lg border bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b bg-gray-50/80 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Checkbox
                          checked={shopIndeterminate ? "indeterminate" : shopChecked}
                          onCheckedChange={(checked) => setShopSelected(group.items, checked === true)}
                        />
                        <Store className="h-4 w-4 shrink-0 text-orange-500" />
                        <span className="truncate text-sm font-bold uppercase tracking-wide text-gray-800">
                          {group.shopName}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                      </div>
                      <Link
                        href={`/shop?shopId=${group.shopId}`}
                        className="shrink-0 text-xs font-semibold text-orange-500 transition-colors hover:text-orange-600"
                      >
                        Xem cửa hàng
                      </Link>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {group.items.map((item) => {
                        const isSelected = selectedIds.includes(cartItemId(item.productId, item.selectedVariant))

                        return (
                          <div
                            key={cartItemId(item.productId, item.selectedVariant)}
                            className="grid gap-4 p-4 lg:grid-cols-[44px_1fr_140px_150px_130px_48px] lg:items-center"
                          >
                            <div className="flex items-center">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => setItemSelected(item.productId, item.selectedVariant, checked === true)}
                              />
                            </div>

                            <div className="flex min-w-0 gap-4">
                              <img
                                src={item.productImageUrl || "/placeholder.svg"}
                                alt={item.productName}
                                className="h-20 w-20 shrink-0 rounded-md border object-cover"
                              />
                              <div className="min-w-0">
                                <h2 className="line-clamp-2 font-semibold text-gray-900 transition-colors hover:text-orange-500">
                                  <Link href={`/shop/product/${item.productId}`}>{item.productName}</Link>
                                </h2>
                                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs text-gray-500 font-medium">Phân loại:</span>
                                  <select
                                    value={item.selectedVariant || ""}
                                    onChange={(e) => updateVariant(item.productId, item.selectedVariant || "", e.target.value)}
                                    className="text-xs text-[#e15c45] font-semibold bg-[#e15c45]/5 px-2 py-0.5 rounded border border-[#e15c45]/20 focus:outline-none focus:ring-1 focus:ring-[#e15c45] cursor-pointer"
                                  >
                                    {getVariantOptions(item.productName, item.categoryName).map((opt) => (
                                      <option key={opt} value={opt} className="text-gray-800 bg-white font-normal">
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <p className="mt-1 text-xs text-gray-500 lg:hidden">
                                  {currency.format(item.price)} đ
                                </p>
                              </div>
                            </div>

                            <p className="hidden text-right text-sm font-medium text-gray-700 lg:block">
                              {currency.format(item.price)} đ
                            </p>

                            <div className="flex items-center lg:justify-center">
                              <div className="flex h-9 overflow-hidden rounded-md border border-gray-200">
                                <button
                                  type="button"
                                  className="flex w-9 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                                  disabled={item.quantity <= 1}
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariant)}
                                  aria-label="Giảm số lượng"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <Input
                                  value={item.quantity}
                                  inputMode="numeric"
                                  className="h-9 w-14 rounded-none border-y-0 text-center shadow-none"
                                  onChange={(event) => {
                                    const nextQuantity = Number.parseInt(event.target.value, 10)
                                    updateQuantity(item.productId, Number.isFinite(nextQuantity) ? nextQuantity : 1, item.selectedVariant)
                                  }}
                                />
                                <button
                                  type="button"
                                  className="flex w-9 items-center justify-center text-gray-600 hover:bg-gray-50"
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedVariant)}
                                  aria-label="Tăng số lượng"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-right font-bold text-orange-600">
                              {currency.format(item.price * item.quantity)} đ
                            </p>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleRemove(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="h-fit rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Tổng đơn hàng</h2>
              <div className="mb-4 flex items-center gap-3 border-b pb-4">
                <Checkbox checked={allSelected} onCheckedChange={(checked) => setAllSelected(checked === true)} />
                <span className="text-sm font-medium text-gray-700">Chọn tất cả ({cart.length})</span>
              </div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Đã chọn</span>
                <span>{selectedItems.length} sản phẩm</span>
              </div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Tạm tính</span>
                <span>{currency.format(selectedTotal)} đ</span>
              </div>
              <div className="mb-4 flex justify-between text-sm">
                <span>Vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-orange-600">{currency.format(selectedTotal)} đ</span>
              </div>
              <Button
                className="mt-6 w-full bg-orange-500 hover:bg-orange-600"
                disabled={selectedItems.length === 0}
                onClick={handleCheckout}
              >
                Tiến hành thanh toán
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
