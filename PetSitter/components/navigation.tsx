"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LogOut,
  Menu,
  MessageCircleMore,
  Package,
  PawPrint,
  Phone,
  Settings,
  ShoppingCart,
  User,
} from "lucide-react"

import { UserRole } from "@/enum/UserRole"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getAvatarUrl } from "@/lib/avatar"

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/shop", label: "Sản phẩm" },
  { href: "/features", label: "Dịch vụ" },
  { href: "/blog", label: "Bài viết" },
  { href: "/contact", label: "Liên hệ" },
]

type AuthUser = NonNullable<ReturnType<typeof useAuth>["user"]>

function UserSummaryPill({ user }: { user: AuthUser }) {
  return (
    <div className="hidden min-w-0 items-center gap-2 rounded-full border border-[#d9e4dd]/70 bg-white/70 px-2.5 py-1.5 text-left shadow-sm backdrop-blur-sm lg:flex">
      <Avatar className="size-8 ring-1 ring-[#1f6654]/10">
        <AvatarImage src={getAvatarUrl(user.profilePictureUrl)} alt={user.fullName} className="object-cover" />
        <AvatarFallback>
          <img src="/placeholder-user.jpg" alt={user.fullName} className="h-full w-full object-cover" />
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0">
        <span className="block max-w-36 truncate text-sm font-semibold leading-4 text-[#16312a]">{user.fullName}</span>
        <span className="block max-w-36 truncate text-xs font-medium leading-4 text-[#526761]">
          {user.phoneNumber || "Chưa cập nhật SĐT"}
        </span>
      </span>
    </div>
  )
}

export function Navigation() {
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    if (cart) {
      setCartCount(cart.reduce((total, item) => total + item.quantity, 0))
    }
  }, [cart])

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[#d9e4dd]/40 bg-[#f7f8f3]/80 backdrop-blur-md shadow-[0_2px_20px_-4px_rgba(22,49,42,0.05)] transition-all duration-300">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label="Trang chủ PetSitter">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#e15c45] to-[#f47f68] text-white shadow-[0_4px_12px_rgba(225,92,69,0.25)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_4px_18px_rgba(225,92,69,0.35)]">
            <PawPrint className="size-5 transition-transform duration-300 group-hover:rotate-12" />
          </span>
          <span className="truncate text-xl font-bold tracking-tight text-[#16312a] transition-colors duration-300 group-hover:text-[#1f6654]">PetSitter</span>
        </Link>

        {user ? (
          <UserSummaryPill user={user} />
        ) : (
          <a
            href="tel:+84901135618"
            className="group hidden items-center gap-2 rounded-full border border-[#d9e4dd]/70 bg-white/70 px-3 py-1.5 text-sm font-semibold text-[#526761] shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[#e15c45]/30 hover:bg-white hover:text-[#16312a] hover:shadow-md sm:flex"
          >
            <Phone className="size-4 text-[#b44735] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            <span className="text-xs uppercase tracking-wide text-[#b44735]">Hotline</span>
            <span>(+84) 901 135 618</span>
          </a>
        )}

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                isActive(link.href)
                  ? "bg-[#e3f0ea]/80 border border-[#d2e5db] text-[#16312a] shadow-sm shadow-[#16312a]/2"
                  : "text-[#526761] border border-transparent hover:bg-[#e3f0ea]/45 hover:border-[#d2e5db]/60 hover:text-[#16312a] hover:shadow-xs"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Mở điều hướng">
                <Menu className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navLinks.map((link) => (
                <DropdownMenuItem
                  key={link.href}
                  asChild
                  className={
                    isActive(link.href)
                      ? "bg-[#e3f0ea]/70 text-[#16312a] font-semibold focus:bg-[#e3f0ea]/80"
                      : "text-[#526761] focus:bg-[#16312a]/5"
                  }
                >
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild>
                <Link href="/cart" className="relative flex w-full items-center justify-between">
                  <span className="flex items-center">
                    <ShoppingCart className="mr-2 size-4" />
                    Giỏ hàng
                  </span>
                  {cartCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e15c45] px-1.5 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
              {!user && (
                <DropdownMenuItem asChild>
                  <Link href="/login">
                    <User className="mr-2 size-4" />
                    Đăng nhập
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" asChild aria-label="Giỏ hàng" className="relative hidden hover:bg-[#16312a]/5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 sm:inline-flex">
            <Link href="/cart">
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e15c45] px-1 text-[10px] font-bold text-white shadow-md animate-in zoom-in duration-300 ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative size-10 rounded-full px-0 ring-2 ring-[#1f6654]/10 hover:ring-[#1f6654] transition-all duration-300" aria-label="Menu tài khoản">
                  <Avatar className="size-8">
                    <AvatarImage src={getAvatarUrl(user.profilePictureUrl)} alt={user.fullName} className="object-cover" />
                    <AvatarFallback>
                      <img src="/placeholder-user.jpg" alt={user.fullName} className="h-full w-full object-cover" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60" align="end" forceMount>
                <div className="p-2">
                  <p className="truncate font-semibold text-[#16312a]">{user.fullName}</p>
                  <p className="truncate text-sm text-muted-foreground">{user.phoneNumber || "Chưa cập nhật SĐT"}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 size-4" />
                    Trang cá nhân
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">
                    <Package className="mr-2 size-4" />
                    Đơn hàng của tôi
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/chat">
                    <MessageCircleMore className="mr-2 size-4" />
                    Tin nhắn
                  </Link>
                </DropdownMenuItem>

                {(user.role === UserRole.Shop || user.role === UserRole.Intermediary) && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <Settings className="mr-2 size-4" />
                        Bảng điều khiển cửa hàng
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/shop/upload">
                        <Package className="mr-2 size-4" />
                        Đăng sản phẩm
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 size-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="hidden h-10 rounded-full bg-gradient-to-r from-[#1f6654] to-[#16312a] px-5 text-sm font-semibold text-white shadow-md shadow-[#1f6654]/10 hover:shadow-lg hover:shadow-[#1f6654]/20 hover:-translate-y-[1px] active:translate-y-0 transition-all duration-300 sm:inline-flex">
              <Link href="/login">Đăng nhập</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
