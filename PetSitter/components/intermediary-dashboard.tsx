"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  BellRing,
  Check,
  CheckCircle,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Clock,
  CornerDownRight,
  CreditCard,
  DollarSign,
  Eye,
  FileText,
  Filter,
  HelpCircle,
  LayoutDashboard,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  PawPrint,
  Percent,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Truck,
  Unlock,
  UserRound,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { toast } from "sonner"

import { getIntermediaryDashboard } from "@/components/api/intermediary-dashboard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { DEFAULT_SHOP_AVATAR, DEFAULT_USER_AVATAR, getAvatarUrl } from "@/lib/avatar"
import type {
  CustomerSummary,
  DashboardOverview,
  IntermediaryDashboardData,
  NotificationItem,
  RankedProduct,
  RankedService,
  RecentOrderSummary,
  ReviewAlert,
  ShopSummary,
} from "@/types/intermediary-dashboard"

// Extended internal types for rich interactivity
interface SupportTicket {
  ticketId: string
  title: string
  creatorName: string
  creatorRole: "customer" | "shop"
  createdAt: string
  status: "open" | "processing" | "resolved"
  category: "dispute" | "technical" | "payment" | "general"
  description: string
  messages: Array<{
    sender: "admin" | "user"
    senderName: string
    content: string
    createdAt: string
  }>
}

interface PayoutTransaction {
  txId: string
  shopName: string
  amount: number
  fee: number
  status: "completed" | "pending"
  date: string
}

const toneClassName: Record<string, string> = {
  info: "bg-sky-50 text-sky-700 border-sky-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-rose-50 text-rose-700 border-rose-200",
}

const statusColors = ["#1f6654", "#f59e0b", "#dc2626"]
const DASHBOARD_DATE_LABEL = "Thứ bảy, 13 tháng 6, 2026"

export default function IntermediaryDashboard() {
  const [data, setData] = useState<IntermediaryDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sidebar navigation active tab
  const [activeTab, setActiveTab] = useState<string>("overview")

  // Interactive Live States
  const [shops, setShops] = useState<ShopSummary[]>([])
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [orders, setOrders] = useState<RecentOrderSummary[]>([])
  const [reviews, setReviews] = useState<ReviewAlert[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [finance, setFinance] = useState<any>(null)

  // Catalogs
  const [topProducts, setTopProducts] = useState<RankedProduct[]>([])
  const [topServices, setTopServices] = useState<RankedService[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<RankedProduct[]>([])

  // Added Custom states for Ticket & Dispute / Payments
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [transactions, setTransactions] = useState<PayoutTransaction[]>([])

  // Filtering & Search states
  const [shopSearch, setShopSearch] = useState("")
  const [shopFilter, setShopFilter] = useState("all") // all, active, pending, locked

  const [custSearch, setCustSearch] = useState("")

  const [catalogType, setCatalogType] = useState<"product" | "service">("product")
  const [catalogSearch, setCatalogSearch] = useState("")
  const [catalogFilter, setCatalogFilter] = useState("all") // all, in_stock, out_of_stock, pending

  const [orderSubTab, setOrderSubTab] = useState("all") // all, pending, processing, shipping, completed, cancelled
  const [orderSearch, setOrderSearch] = useState("")

  const [reviewFilter, setReviewFilter] = useState("all") // all, positive, negative

  const [ticketFilter, setTicketFilter] = useState("all") // all, open, processing, resolved

  const [notificationFilter, setNotificationFilter] = useState("all") // all, critical, warning, success, info

  // Dialog States for Detailed inspection
  const [selectedShop, setSelectedShop] = useState<ShopSummary | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<RecentOrderSummary | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [ticketReply, setTicketReply] = useState("")

  // Review reply state
  const [replyReviewId, setReplyReviewId] = useState<string | null>(null)
  const [reviewReplyText, setReviewReplyText] = useState("")

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      try {
        const result = await getIntermediaryDashboard()
        if (!active) return
        setData(result)

        // Sync interactive states with API results
        setShops(result.shops)
        setCustomers(result.customers)
        setOrders(result.orders.recent)
        setReviews(result.feedback.negativeReviews)
        setNotifications(result.notifications)
        setOverview(result.overview)
        setFinance(result.finance)
        setTopProducts(result.catalog.topProducts)
        setTopServices(result.catalog.topServices)
        setLowStockProducts(result.catalog.lowStockProducts)

        // Mock Support & Dispute Tickets
        setTickets([
          {
            ticketId: "TK-701",
            title: "Khiếu nại: Thức ăn Royal Canin hết hạn",
            creatorName: "Lê Minh Tuấn",
            creatorRole: "customer",
            createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
            status: "open",
            category: "dispute",
            description: "Tôi nhận được gói thức ăn hạt Royal Canin cho chó nhưng hạn sử dụng chỉ còn 3 ngày. Tôi yêu cầu Shop hoàn trả lại tiền.",
            messages: [
              { sender: "user", senderName: "Lê Minh Tuấn", content: "Tôi đặt gói 3kg Royal Canin Puppy. Hạn sử dụng trên bao bì đến ngày 31/05/2026 trong khi hôm nay đã là 28/05/2026. Cho ăn không kịp!", createdAt: new Date(Date.now() - 3600000 * 30).toISOString() },
              { sender: "admin", senderName: "Admin Hệ thống", content: "Chào bạn Lê Minh Tuấn, hệ thống đã ghi nhận. Chúng tôi đang liên hệ đại diện Pet Mart Quận 1 để yêu cầu đối soát lô hàng.", createdAt: new Date(Date.now() - 3600000 * 26).toISOString() }
            ]
          },
          {
            ticketId: "TK-702",
            title: "Shop báo lỗi: Không nhận được thông báo đơn hàng",
            creatorName: "Mimi Pet Shop",
            creatorRole: "shop",
            createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
            status: "processing",
            category: "technical",
            description: "Shop Mimi Pet Shop phản ánh không nhận được chuông thông báo khi có đơn hàng mới từ ứng dụng di động.",
            messages: [
              { sender: "user", senderName: "Mimi Pet Shop", content: "Hôm nay shop bị trễ 2 đơn vì không nhận được âm thanh thông báo đơn mới trên web/app. Vui lòng kiểm tra cổng SignalR.", createdAt: new Date(Date.now() - 3600000 * 10).toISOString() },
              { sender: "admin", senderName: "Kỹ thuật viên", content: "Chúng tôi đang kiểm tra log kết nối kết nối SignalR của tài khoản shop. Xin chờ trong giây lát.", createdAt: new Date(Date.now() - 3600000 * 8).toISOString() }
            ]
          },
          {
            ticketId: "TK-703",
            title: "Yêu cầu thanh toán tiền hoa hồng tháng này",
            creatorName: "Poodle House",
            creatorRole: "shop",
            createdAt: new Date(Date.now() - 3600000 * 50).toISOString(),
            status: "resolved",
            category: "payment",
            description: "Yêu cầu đối soát doanh thu dịch vụ spa tắm cắt tỉa lông mèo đợt 1 tháng 5.",
            messages: [
              { sender: "user", senderName: "Poodle House", content: "Tôi gửi yêu cầu đối soát số tiền 3,100,000 đ tích lũy tuần qua.", createdAt: new Date(Date.now() - 3600000 * 50).toISOString() },
              { sender: "admin", senderName: "Kế toán hệ thống", content: "Hệ thống đã phê duyệt và chuyển khoản thành công vào tài khoản đăng ký của Poodle House.", createdAt: new Date(Date.now() - 3600000 * 48).toISOString() }
            ]
          }
        ])

        // Mock Payout transactions
        setTransactions([
          { txId: "TX-301", shopName: "Pet Mart Quận 1", amount: 14500000, fee: 1450000, status: "completed", date: new Date(Date.now() - 3600000 * 48).toISOString() },
          { txId: "TX-302", shopName: "Mimi Pet Shop", amount: 8200000, fee: 820000, status: "completed", date: new Date(Date.now() - 3600000 * 72).toISOString() },
          { txId: "TX-303", shopName: "Poodle House", amount: 3100000, fee: 310000, status: "pending", date: new Date(Date.now() - 3600000 * 5).toISOString() }
        ])

        setError(null)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "Không tải được bảng điều khiển")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  // Dynamic calculations for pending actions indicators
  const shopAlertCount = useMemo(() => shops.filter(s => s.status === "pending").length, [shops])
  const ticketAlertCount = useMemo(() => tickets.filter(t => t.status === "open").length, [tickets])
  const orderAlertCount = useMemo(() => orders.filter(o => o.status === "pending" || o.status === "cho xu ly").length, [orders])
  const productAlertCount = useMemo(() => topProducts.filter(p => p.status === "pending" || p.stockQuantity === 0).length, [topProducts])
  const complaintCount = useMemo(() => reviews.length, [reviews])
  const unreadNotificationCount = useMemo(() => notifications.length, [notifications])

  // --- ACTIONS ---

  // Action: Approve Shop
  const handleApproveShop = (shopId: string) => {
    setShops(prev => prev.map(s => s.shopId === shopId ? { ...s, status: "active" } : s))
    if (overview) {
      setOverview({
        ...overview,
        activeShops: overview.activeShops + 1,
        pendingShops: Math.max(0, overview.pendingShops - 1)
      })
    }
    // Update internal data if selected
    if (selectedShop && selectedShop.shopId === shopId) {
      setSelectedShop({ ...selectedShop, status: "active" })
    }
    toast.success("Đã phê duyệt shop hoạt động thành công!")
  }

  // Action: Lock Shop
  const handleLockShop = (shopId: string) => {
    setShops(prev => prev.map(s => s.shopId === shopId ? { ...s, status: "locked" } : s))
    if (overview) {
      setOverview({
        ...overview,
        activeShops: Math.max(0, overview.activeShops - 1),
        lockedShops: overview.lockedShops + 1
      })
    }
    if (selectedShop && selectedShop.shopId === shopId) {
      setSelectedShop({ ...selectedShop, status: "locked" })
    }
    toast.warning("Đã tạm khóa tài khoản shop này!")
  }

  // Action: Unlock Shop
  const handleUnlockShop = (shopId: string) => {
    setShops(prev => prev.map(s => s.shopId === shopId ? { ...s, status: "active" } : s))
    if (overview) {
      setOverview({
        ...overview,
        activeShops: overview.activeShops + 1,
        lockedShops: Math.max(0, overview.lockedShops - 1)
      })
    }
    if (selectedShop && selectedShop.shopId === shopId) {
      setSelectedShop({ ...selectedShop, status: "active" })
    }
    toast.success("Đã mở khóa hoạt động cho shop!")
  }

  // Action: Approve Product
  const handleApproveProduct = (productId: string) => {
    setTopProducts(prev => prev.map(p => p.productId === productId ? { ...p, status: "in_stock" } : p))
    if (overview) {
      setOverview({
        ...overview,
        totalProducts: overview.totalProducts + 1
      })
    }
    toast.success("Sản phẩm đã được duyệt bán trên nền tảng!")
  }

  // Action: Progress Order Status
  const handleProgressOrder = (orderId: string, nextStatus: string) => {
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: nextStatus } : o))
    
    // Sync overview order rates and counts if order gets completed
    if (nextStatus === "completed" || nextStatus === "hoan thanh") {
      if (overview && finance) {
        const orderAmount = orders.find(o => o.orderId === orderId)?.totalAmount || 0
        setOverview({
          ...overview,
          totalRevenue: overview.totalRevenue + orderAmount,
          completedRate: Math.round(((overview.totalOrders * (overview.completedRate / 100) + 1) / overview.totalOrders) * 1000) / 10
        })
        setFinance({
          ...finance,
          grossRevenue: finance.grossRevenue + orderAmount,
          platformFee: Math.round((finance.grossRevenue + orderAmount) * 0.1),
          netPayout: Math.round((finance.grossRevenue + orderAmount) * 0.9)
        })
      }
      toast.success("Đơn hàng đã hoàn thành và đối soát doanh thu!")
    } else {
      toast.success(`Đã cập nhật trạng thái đơn hàng thành: ${statusLabel(nextStatus)}`)
    }

    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder({ ...selectedOrder, status: nextStatus })
    }
  }

  // Action: Cancel Order
  const handleCancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: "cancelled" } : o))
    if (overview) {
      setOverview({
        ...overview,
        cancelledRate: Math.round(((overview.totalOrders * (overview.cancelledRate / 100) + 1) / overview.totalOrders) * 1000) / 10
      })
    }
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder({ ...selectedOrder, status: "cancelled" })
    }
    toast.error("Đơn hàng đã bị hủy và thực hiện hoàn tiền!")
  }

  // Action: Pay Shop (Commission / Payouts)
  const handlePayShop = (txId: string) => {
    setTransactions(prev => prev.map(tx => tx.txId === txId ? { ...tx, status: "completed" } : tx))
    toast.success("Lệnh chuyển khoản doanh thu cho Shop đã thành công!")
  }

  // Action: Resolve Support Dispute / Ticket
  const handleResolveTicket = (ticketId: string, outcome?: "refund" | "payout") => {
    setTickets(prev => prev.map(t => t.ticketId === ticketId ? { ...t, status: "resolved" } : t))
    if (overview) {
      setOverview({
        ...overview,
        openIssues: Math.max(0, overview.openIssues - 1)
      })
    }
    
    // Add Resolution Message
    let resolutionMessage = "Yêu cầu đã được đóng và giải quyết thành công."
    if (outcome === "refund") {
      resolutionMessage = "Admin đã quyết định: Đơn hàng bị lỗi. Hoàn trả 100% tiền lại cho tài khoản Khách hàng. Đóng tranh chấp."
    } else if (outcome === "payout") {
      resolutionMessage = "Admin đã quyết định: Giao hàng thành công đúng mô tả. Giải ngân doanh thu đơn hàng cho Shop. Đóng tranh chấp."
    }

    setTickets(prev => prev.map(t => {
      if (t.ticketId === ticketId) {
        return {
          ...t,
          messages: [
            ...t.messages,
            { sender: "admin", senderName: "Hệ thống Phán quyết", content: resolutionMessage, createdAt: new Date().toISOString() }
          ]
        }
      }
      return t
    }))

    if (selectedTicket && selectedTicket.ticketId === ticketId) {
      setSelectedTicket({
        ...selectedTicket,
        status: "resolved",
        messages: [
          ...selectedTicket.messages,
          { sender: "admin", senderName: "Hệ thống Phán quyết", content: resolutionMessage, createdAt: new Date().toISOString() }
        ]
      })
    }

    toast.success("Đã hoàn tất phán quyết tranh chấp và đóng Ticket!")
  }

  // Action: Send Message inside Ticket Dialog
  const handleSendTicketReply = () => {
    if (!selectedTicket || !ticketReply.trim()) return

    const newMsg = {
      sender: "admin" as const,
      senderName: "Admin Hệ thống",
      content: ticketReply,
      createdAt: new Date().toISOString()
    }

    setTickets(prev => prev.map(t => {
      if (t.ticketId === selectedTicket.ticketId) {
        return {
          ...t,
          status: t.status === "open" ? "processing" : t.status,
          messages: [...t.messages, newMsg]
        }
      }
      return t
    }))

    setSelectedTicket({
      ...selectedTicket,
      status: selectedTicket.status === "open" ? "processing" : selectedTicket.status,
      messages: [...selectedTicket.messages, newMsg]
    })

    setTicketReply("")
    toast.info("Đã gửi phản hồi hỗ trợ!")
  }

  // Action: Resolve Negative Review
  const handleResolveReview = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.reviewId !== reviewId))
    if (overview) {
      setOverview({
        ...overview,
        openIssues: Math.max(0, overview.openIssues - 1)
      })
    }
    setReplyReviewId(null)
    setReviewReplyText("")
    toast.success("Đã ẩn hoặc xử lý thành công khiếu nại đánh giá xấu này!")
  }

  // Action: Submit Review Reply
  const handleSendReviewReply = (reviewId: string) => {
    if (!reviewReplyText.trim()) return
    // Simple state update simulation
    toast.success(`Đã đăng phản hồi của Admin đến Shop và khách hàng!`)
    setReviews(prev => prev.filter(r => r.reviewId !== reviewId))
    if (overview) {
      setOverview({
        ...overview,
        openIssues: Math.max(0, overview.openIssues - 1)
      })
    }
    setReplyReviewId(null)
    setReviewReplyText("")
  }

  // Action: Manage Notifications list (read, delete)
  const handleMarkNotificationRead = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index))
    toast.success("Đã đánh dấu đã đọc thông báo này!")
  }

  const handleMarkAllNotificationsRead = () => {
    setNotifications([])
    toast.success("Đã xóa tất cả thông báo hệ thống!")
  }

  // --- FILTERS & SEARCH LABELS ---

  // Shop Filter
  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      const matchesSearch = shop.shopName.toLowerCase().includes(shopSearch.toLowerCase()) ||
                            shop.ownerName.toLowerCase().includes(shopSearch.toLowerCase()) ||
                            shop.phoneNumber.includes(shopSearch)
      
      const matchesFilter = shopFilter === "all" ||
                            (shopFilter === "active" && shop.status === "active") ||
                            (shopFilter === "pending" && shop.status === "pending") ||
                            (shopFilter === "locked" && shop.status === "locked")

      return matchesSearch && matchesFilter
    })
  }, [shops, shopSearch, shopFilter])

  // Customer Filter
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      return c.fullName.toLowerCase().includes(custSearch.toLowerCase()) ||
             c.email.toLowerCase().includes(custSearch.toLowerCase()) ||
             c.phoneNumber.includes(custSearch)
    })
  }, [customers, custSearch])

  // Product/Service Filter
  const filteredCatalog = useMemo(() => {
    if (catalogType === "product") {
      return topProducts.filter(p => {
        const matchesSearch = p.productName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                              p.shopName.toLowerCase().includes(catalogSearch.toLowerCase())
        
        const matchesFilter = catalogFilter === "all" ||
                              (catalogFilter === "in_stock" && p.stockQuantity !== undefined && p.stockQuantity > 0) ||
                              (catalogFilter === "out_of_stock" && p.stockQuantity === 0) ||
                              (catalogFilter === "pending" && p.status === "pending")

        return matchesSearch && matchesFilter
      })
    } else {
      return topServices.filter(s => {
        const matchesSearch = s.serviceName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                              s.shopName.toLowerCase().includes(catalogSearch.toLowerCase())
        
        const matchesFilter = catalogFilter === "all" ||
                              (catalogFilter === "in_stock" && s.status === "available") ||
                              (catalogFilter === "out_of_stock" && s.status === "busy") ||
                              (catalogFilter === "pending" && s.status === "pending")

        return matchesSearch && matchesFilter
      })
    }
  }, [topProducts, topServices, catalogType, catalogSearch, catalogFilter])

  // Order Filter
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            o.shopNames.some(name => name.toLowerCase().includes(orderSearch.toLowerCase()))

      const normalizedStatus = o.status.toLowerCase()
      const matchesSubTab = orderSubTab === "all" ||
                            (orderSubTab === "pending" && (normalizedStatus === "pending" || normalizedStatus === "cho xu ly")) ||
                            (orderSubTab === "processing" && normalizedStatus === "processing") ||
                            (orderSubTab === "shipping" && normalizedStatus === "shipping") ||
                            (orderSubTab === "completed" && (normalizedStatus === "completed" || normalizedStatus === "hoan thanh")) ||
                            (orderSubTab === "cancelled" && (normalizedStatus === "cancelled" || normalizedStatus === "da huy"))

      return matchesSearch && matchesSubTab
    })
  }, [orders, orderSearch, orderSubTab])

  // Review Filter
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      if (reviewFilter === "all") return true
      if (reviewFilter === "negative") return r.rating <= 3
      if (reviewFilter === "positive") return r.rating >= 4
      return true
    })
  }, [reviews, reviewFilter])

  // Ticket Filter
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (ticketFilter === "all") return true
      return t.status === ticketFilter
    })
  }, [tickets, ticketFilter])

  // Notification Filter
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (notificationFilter === "all") return true
      return n.tone === notificationFilter
    })
  }, [notifications, notificationFilter])

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4 text-slate-500">
        <RefreshCw className="h-10 w-10 animate-spin text-[#1f6654]" />
        <p className="text-base font-medium">Đang khởi tạo giao diện điều phối trung gian...</p>
      </div>
    )
  }

  if (error || !data || !overview || !finance) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700 shadow-sm">
        <AlertTriangle className="mx-auto h-12 w-12 text-rose-500" />
        <h2 className="mt-4 text-lg font-semibold">Lỗi tải dữ liệu</h2>
        <p className="mt-2 text-sm text-rose-600/90">{error || "Không thể kết nối đến máy chủ API để lấy thông tin."}</p>
        <Button variant="outline" className="mt-6 border-rose-200 hover:bg-rose-100/50" onClick={() => window.location.reload()}>
          Tải lại trang
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="sticky top-0 h-screen w-72 shrink-0 border-r border-[#dbe6e1] bg-[#f4faf6] px-4 py-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-3 py-1 bg-white/60 rounded-xl border border-[#e1ece7] shadow-sm">
            <div className="h-9 w-9 rounded-lg bg-[#1f6654] flex items-center justify-center shadow-md">
              <PawPrint className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#17322c]">PETSITTER ADMIN</p>
              <p className="text-[10px] text-[#557068] font-medium tracking-wide">ĐIỀU PHỐI TRUNG GIAN</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-[#8ba29a] uppercase tracking-wider mb-2">Hệ thống</p>
            
            <SidebarBtn icon={<LayoutDashboard />} label="Tổng quan" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
            
            <SidebarBtn 
              icon={<Store />} 
              label="Quản lý Shop" 
              active={activeTab === "shops"} 
              onClick={() => setActiveTab("shops")} 
              badge={shopAlertCount > 0 ? shopAlertCount : undefined}
              badgeColor="bg-amber-500 text-white"
            />
            
            <SidebarBtn icon={<Users />} label="Quản lý Khách hàng" active={activeTab === "customers"} onClick={() => setActiveTab("customers")} />
            
            <SidebarBtn 
              icon={<ShoppingBag />} 
              label="Sản phẩm & Dịch vụ" 
              active={activeTab === "catalog"} 
              onClick={() => setActiveTab("catalog")}
              badge={productAlertCount > 0 ? productAlertCount : undefined}
              badgeColor="bg-[#1f6654]"
            />
            
            <SidebarBtn 
              icon={<ClipboardList />} 
              label="Quản lý Đơn hàng" 
              active={activeTab === "orders"} 
              onClick={() => setActiveTab("orders")}
              badge={orderAlertCount > 0 ? orderAlertCount : undefined}
              badgeColor="bg-[#4766cc]"
            />

            <SidebarBtn 
              icon={<MessageSquare />} 
              label="Đánh giá & Phản hồi" 
              active={activeTab === "feedback"} 
              onClick={() => setActiveTab("feedback")}
              badge={complaintCount > 0 ? complaintCount : undefined}
              badgeColor="bg-rose-500"
            />

            <SidebarBtn icon={<WalletCards />} label="Thanh toán & Hoa hồng" active={activeTab === "finance"} onClick={() => setActiveTab("finance")} />
            
            <SidebarBtn icon={<BarChart3 />} label="Thống kê & Biểu đồ" active={activeTab === "charts"} onClick={() => setActiveTab("charts")} />
            
            <SidebarBtn 
              icon={<HelpCircle />} 
              label="Hỗ trợ & Tranh chấp" 
              active={activeTab === "support"} 
              onClick={() => setActiveTab("support")}
              badge={ticketAlertCount > 0 ? ticketAlertCount : undefined}
              badgeColor="bg-red-600"
            />

            <SidebarBtn 
              icon={<Bell />} 
              label="Trung tâm Thông báo" 
              active={activeTab === "notifications"} 
              onClick={() => setActiveTab("notifications")}
              badge={unreadNotificationCount > 0 ? unreadNotificationCount : undefined}
              badgeColor="bg-rose-500"
            />
          </div>
        </div>

        <div className="px-3 pt-4 border-t border-[#e2eae6]">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-[#b8cfc5]">
              <AvatarFallback className="bg-[#1f6654] text-white font-bold">AD</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#17322c]">Admin Trung Gian</p>
              <p className="truncate text-xs text-[#6e857e]">admin@petsitter.vn</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* --- HEADER --- */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#e1ece7] bg-white/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Badge className="bg-[#edf6f1] text-[#1f6654] hover:bg-[#edf6f1] border border-[#d6e9dd] font-semibold text-xs py-0.5">
              Vai trò: Điều phối viên trung gian
            </Badge>
            <span className="text-xs text-slate-400">·</span>
            <p className="text-xs text-slate-500 font-medium">Hệ thống vận hành đa shop thú cưng</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-700">{DASHBOARD_DATE_LABEL}</p>
              <p className="text-[10px] font-medium text-slate-400">Hà Nội, Việt Nam</p>
            </div>
            
            <Separator orientation="vertical" className="h-8" />
            
            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-slate-100" onClick={() => setActiveTab("notifications")}>
              <Bell className="h-5 w-5 text-slate-600" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-2 ring-white">
                  {unreadNotificationCount}
                </span>
              )}
            </Button>
          </div>
        </header>

        {/* --- DYNAMIC VIEWS MAIN AREA --- */}
        <div className="flex-grow p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-8">
          
          {/* ==================================================== */}
          {/* TAB 1: OVERVIEW (TỔNG QUAN) */}
          {/* ==================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="rounded-2xl border border-[#dbe6e1] bg-[linear-gradient(135deg,#f4faf6,white_44%,#eef4ff)] p-6 shadow-sm">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5de] bg-white/80 px-3 py-1 text-xs text-[#38584f] font-semibold">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Bảng Điều Phối Trung Gian
                  </div>
                  <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#18352e] sm:text-3xl">
                    Chào mừng trở lại, Admin!
                  </h1>
                  <p className="mt-2 text-xs sm:text-sm text-[#557068] leading-relaxed">
                    Hôm nay hệ thống của bạn đang điều phối <b>{shops.length} shop thú cưng</b> và phục vụ <b>{overview.customers} khách hàng</b>. Hãy kiểm tra các yêu cầu chờ phê duyệt và phản hồi hỗ trợ dưới đây.
                  </p>
                </div>

                {/* Stat KPI cards */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatKpiCard title="Shop Đang Hoạt Động" value={shops.filter(s => s.status === "active").length} detail={`${shops.filter(s => s.status === "pending").length} shop chờ duyệt`} icon={<Store className="text-[#1f6654]" />} />
                  <StatKpiCard title="Khách Hàng Đăng Ký" value={overview.customers} detail={`${overview.repeatCustomersRate}% quay lại mua sắm`} icon={<UserRound className="text-[#b44735]" />} />
                  <StatKpiCard title="Đơn Hàng Hôm Nay" value={overview.ordersToday} detail={`Tổng ${overview.ordersThisMonth} đơn tháng này`} icon={<ClipboardList className="text-[#4766cc]" />} />
                  <StatKpiCard title="Doanh Thu Toàn Hệ Thống" value={formatCurrency(finance.grossRevenue)} detail={`${formatCurrency(finance.platformFee)} phí nền tảng (10%)`} icon={<CircleDollarSign className="text-[#7c3aed]" />} />
                </div>
              </div>

              {/* conversion metrics progress row */}
              <div className="grid gap-6 sm:grid-cols-3">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-500">Tỉ Lệ Đơn Hoàn Thành</span>
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">{overview.completedRate}%</Badge>
                    </div>
                    <Progress value={overview.completedRate} className="h-2 bg-slate-100 [&>div]:bg-emerald-600" />
                    <p className="text-[10px] text-slate-400 mt-2">Dựa trên đơn hoàn tất thanh toán & bàn giao hàng</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-500">Tỉ Lệ Đơn Bị Hủy</span>
                      <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50">{overview.cancelledRate}%</Badge>
                    </div>
                    <Progress value={overview.cancelledRate} className="h-2 bg-slate-100 [&>div]:bg-rose-500" />
                    <p className="text-[10px] text-slate-400 mt-2">Khách hàng hủy hoặc shop từ chối cung cấp</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-500">Tỉ Lệ Hoàn Trả / Hoàn Tiền</span>
                      <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">{overview.returnRate}%</Badge>
                    </div>
                    <Progress value={overview.returnRate} className="h-2 bg-slate-100 [&>div]:bg-amber-500" />
                    <p className="text-[10px] text-slate-400 mt-2">Tranh chấp phát sinh cần hoàn lại ví</p>
                  </CardContent>
                </Card>
              </div>

              {/* Action Center - Urgent items */}
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                {/* Pending Tasks */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base text-[#18352e] flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-amber-500" />
                      Trung Tâm Xử Lý Khẩn Cấp
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Item 1: Pending Shops */}
                    {shops.some(s => s.status === "pending") ? (
                      <div className="flex items-center justify-between p-3 rounded-xl border border-amber-100 bg-amber-50/30 text-xs">
                        <div className="flex items-center gap-3">
                          <Store className="h-5 w-5 text-amber-500 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-700">Yêu cầu duyệt Shop mới</p>
                            <p className="text-slate-500">Có {shops.filter(s => s.status === "pending").length} Shop đang đợi cấp phép hoạt động</p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-3 h-8" onClick={() => setActiveTab("shops")}>
                          Duyệt Ngay
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-400 line-through">Duyệt Shop mới</p>
                            <p className="text-slate-400">Không có shop nào đang chờ cấp phép</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Item 2: Pending Products */}
                    {topProducts.some(p => p.status === "pending") ? (
                      <div className="flex items-center justify-between p-3 rounded-xl border border-sky-100 bg-sky-50/30 text-xs">
                        <div className="flex items-center gap-3">
                          <ShoppingBag className="h-5 w-5 text-sky-500 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-700">Sản phẩm cần kiểm duyệt bán</p>
                            <p className="text-slate-500">Có {topProducts.filter(p => p.status === "pending").length} mặt hàng đang chờ Admin kiểm duyệt</p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-[#1f6654] hover:bg-[#154639] text-white text-xs font-medium px-3 h-8" onClick={() => setActiveTab("catalog")}>
                          Xem & Duyệt
                        </Button>
                      </div>
                    ) : null}

                    {/* Item 3: Disputes */}
                    {tickets.some(t => t.status === "open" && t.category === "dispute") ? (
                      <div className="flex items-center justify-between p-3 rounded-xl border border-rose-100 bg-rose-50/30 text-xs">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-700">Tranh chấp đơn hàng</p>
                            <p className="text-slate-500">Có {tickets.filter(t => t.status === "open" && t.category === "dispute").length} vụ khiếu nại giữa shop và khách</p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium px-3 h-8" onClick={() => setActiveTab("support")}>
                          Xử Lý Tranh Chấp
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-400 line-through">Tranh chấp đơn hàng</p>
                            <p className="text-slate-400">Không có vụ tranh chấp mở nào</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Performers Panel */}
                <Card className="shadow-sm flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-[#18352e]">Top Biểu Tượng Hệ Thống</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl border border-emerald-100 bg-[#f4faf6] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full border border-emerald-200 overflow-hidden relative shrink-0">
                          <img src={DEFAULT_SHOP_AVATAR} alt="shop" className="object-cover h-full w-full" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1f6654] uppercase tracking-wider">Top Doanh Thu</p>
                          <p className="font-bold text-[#18352e] text-sm truncate">{shops[0]?.shopName || "Đang cập nhật..."}</p>
                          <p className="text-[10px] text-slate-500 truncate">Doanh thu: {formatCurrency(shops[0]?.revenue || 0)}</p>
                        </div>
                      </div>
                      <Badge className="bg-[#1f6654] text-white">⭐ {shops[0]?.rating || "5.0"}/5</Badge>
                    </div>

                    <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full border border-indigo-200 overflow-hidden relative shrink-0">
                          <img src={DEFAULT_SHOP_AVATAR} alt="shop" className="object-cover h-full w-full" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Dịch Vụ Phổ Biến</p>
                          <p className="font-bold text-[#18352e] text-sm truncate">{topServices[0]?.serviceName || "Grooming & Tắm Cắt Tỉa"}</p>
                          <p className="text-[10px] text-slate-500 truncate">{topServices[0]?.bookings || 0} lượt đặt hàng</p>
                        </div>
                      </div>
                      <Badge className="bg-indigo-600 text-white">Hot Service</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: SHOP MANAGEMENT (QUẢN LÝ SHOP) */}
          {/* ==================================================== */}
          {activeTab === "shops" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-[#18352e]">Quản Lý Cửa Hàng Thú Cưng</h1>
                  <p className="text-xs text-slate-500">Phê duyệt, khóa, xem chi tiết và đối soát các shop bán hàng trên hệ thống.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Tìm shop, chủ, SĐT..." 
                      className="pl-9 h-10 border-[#cbdad4] focus:border-[#1f6654]"
                      value={shopSearch}
                      onChange={(e) => setShopSearch(e.target.value)}
                    />
                  </div>

                  <Select value={shopFilter} onValueChange={setShopFilter}>
                    <SelectTrigger className="w-40 border-[#cbdad4] h-10">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="active">Đang hoạt động</SelectItem>
                      <SelectItem value="pending">Chờ duyệt</SelectItem>
                      <SelectItem value="locked">Bị khóa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Shops Grid */}
              {filteredShops.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl bg-slate-50 text-slate-400">
                  <Store className="mx-auto h-12 w-12 opacity-60 mb-2" />
                  <p className="text-sm font-semibold">Không tìm thấy shop thú cưng nào phù hợp bộ lọc.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredShops.map((shop) => (
                    <Card key={shop.shopId} className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                      {/* Accent color top bar depending on status */}
                      <div className={`h-1.5 w-full ${shop.status === "active" ? "bg-emerald-500" : shop.status === "pending" ? "bg-amber-500" : "bg-rose-500"}`} />
                      
                      <CardContent className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                        <div className="flex gap-4">
                          <Avatar className="h-16 w-16 border border-[#b8cfc5] shrink-0">
                            <AvatarImage src={getAvatarUrl(shop.shopImageUrl, DEFAULT_SHOP_AVATAR)} alt={shop.shopName} />
                            <AvatarFallback>
                              <img src={DEFAULT_SHOP_AVATAR} alt={shop.shopName} className="h-full w-full object-cover" />
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-800 truncate text-base">{shop.shopName}</h3>
                              <StatusBadge status={shop.status} />
                            </div>
                            <p className="text-xs font-medium text-slate-500 mt-1">Chủ: {shop.ownerName} ({shop.ownerEmail})</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3 text-slate-400" /> {shop.phoneNumber || "Chưa cập nhật SĐT"}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                              <MapPin className="h-3 w-3 shrink-0 text-slate-400" /> {shop.address || shop.location || "Chưa có địa chỉ"}
                            </p>
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="bg-[#f7faf8] px-2 py-1.5 rounded-lg">
                            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Sản phẩm</p>
                            <p className="text-xs font-bold text-slate-700 mt-0.5">{shop.productCount}</p>
                          </div>
                          <div className="bg-[#f7faf8] px-2 py-1.5 rounded-lg">
                            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Dịch vụ</p>
                            <p className="text-xs font-bold text-slate-700 mt-0.5">{shop.serviceCount}</p>
                          </div>
                          <div className="bg-[#f7faf8] px-2 py-1.5 rounded-lg">
                            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Đơn hàng</p>
                            <p className="text-xs font-bold text-slate-700 mt-0.5">{shop.orderCount}</p>
                          </div>
                          <div className="bg-[#f7faf8] px-2 py-1.5 rounded-lg">
                            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Đánh giá</p>
                            <p className="text-xs font-bold text-amber-600 mt-0.5">★ {shop.rating}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Doanh thu tích lũy</p>
                            <p className="text-base font-bold text-[#1f6654]">{formatCurrency(shop.revenue)}</p>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8 text-xs font-medium px-2.5 border-[#cbdad4] text-slate-600 hover:bg-[#cbdad4]/10" onClick={() => setSelectedShop(shop)}>
                              Xem Chi Tiết
                            </Button>

                            {shop.status === "pending" && (
                              <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3" onClick={() => handleApproveShop(shop.shopId)}>
                                Duyệt Shop
                              </Button>
                            )}

                            {shop.status === "active" && (
                              <Button size="sm" variant="destructive" className="h-8 text-xs font-medium px-3 bg-rose-600 hover:bg-rose-700" onClick={() => handleLockShop(shop.shopId)}>
                                Khóa
                              </Button>
                            )}

                            {shop.status === "locked" && (
                              <Button size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3" onClick={() => handleUnlockShop(shop.shopId)}>
                                Mở khóa
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: CUSTOMER MANAGEMENT (QUẢN LÝ KHÁCH HÀNG) */}
          {/* ==================================================== */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-[#18352e]">Quản Lý Khách Hàng</h1>
                  <p className="text-xs text-slate-500">Xem danh sách, kiểm tra chi tiêu lịch sử giao dịch và ý kiến khiếu nại của khách hàng.</p>
                </div>

                <div className="relative w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Tìm theo tên, email, SĐT..." 
                    className="pl-9 h-10 border-[#cbdad4]"
                    value={custSearch}
                    onChange={(e) => setCustSearch(e.target.value)}
                  />
                </div>
              </div>

              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl bg-slate-50 text-slate-400">
                  <UserRound className="mx-auto h-12 w-12 opacity-60 mb-2" />
                  <p className="text-sm font-semibold">Không tìm thấy khách hàng nào khớp từ khóa.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCustomers.map((cust) => (
                    <Card key={cust.userId} className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border border-[#b8cfc5] shrink-0">
                            <AvatarImage src={getAvatarUrl(cust.profilePictureUrl, DEFAULT_USER_AVATAR)} alt={cust.fullName} />
                            <AvatarFallback>
                              <img src={DEFAULT_USER_AVATAR} alt={cust.fullName} className="h-full w-full object-cover" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 text-sm truncate">{cust.fullName}</h3>
                            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <Mail className="h-2.5 w-2.5 shrink-0" /> {cust.email}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <Phone className="h-2.5 w-2.5 shrink-0" /> {cust.phoneNumber || "Chưa cập nhật SĐT"}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-[#f7faf8] p-2 rounded-lg text-center">
                            <p className="text-[10px] text-slate-400 uppercase">Đơn hàng</p>
                            <p className="font-bold text-slate-700 mt-0.5">{cust.orderCount} đơn</p>
                          </div>
                          <div className="bg-[#f7faf8] p-2 rounded-lg text-center">
                            <p className="text-[10px] text-slate-400 uppercase">Lịch dịch vụ</p>
                            <p className="font-bold text-[#4766cc] mt-0.5">{cust.bookingCount} lượt</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-slate-50/50 p-2 rounded-lg border border-slate-100 text-xs">
                          <div>
                            <p className="text-[10px] text-slate-400">Tổng chi tiêu</p>
                            <p className="font-bold text-[#1f6654]">{formatCurrency(cust.totalSpent)}</p>
                          </div>
                          
                          <Button size="sm" variant="outline" className="h-7 text-[10px] font-semibold border-[#cbdad4]" onClick={() => setSelectedCustomer(cust)}>
                            Xem Hồ Sơ
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: PRODUCT/SERVICE CATALOG (SẢN PHẨM & DỊCH VỤ) */}
          {/* ==================================================== */}
          {activeTab === "catalog" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#cbdad4] pb-4">
                <div className="flex gap-4">
                  <button 
                    className={`pb-2 text-sm font-bold border-b-2 transition-all ${catalogType === "product" ? "border-[#1f6654] text-[#1f6654]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                    onClick={() => { setCatalogType("product"); setCatalogFilter("all"); }}
                  >
                    Mặt hàng sản phẩm ({topProducts.length})
                  </button>
                  <button 
                    className={`pb-2 text-sm font-bold border-b-2 transition-all ${catalogType === "service" ? "border-[#1f6654] text-[#1f6654]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                    onClick={() => { setCatalogType("service"); setCatalogFilter("all"); }}
                  >
                    Gói dịch vụ chăm sóc ({topServices.length})
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-60">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Tìm tên hàng, tên shop..." 
                      className="pl-9 h-10 border-[#cbdad4]"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                    />
                  </div>

                  <Select value={catalogFilter} onValueChange={setCatalogFilter}>
                    <SelectTrigger className="w-40 border-[#cbdad4] h-10">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="in_stock">{catalogType === "product" ? "Còn hàng" : "Đang sẵn sàng"}</SelectItem>
                      <SelectItem value="out_of_stock">{catalogType === "product" ? "Hết hàng" : "Tạm bận"}</SelectItem>
                      <SelectItem value="pending">Chờ phê duyệt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Grid Catalog content */}
              {filteredCatalog.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl bg-slate-50 text-slate-400">
                  <ShoppingBag className="mx-auto h-12 w-12 opacity-60 mb-2" />
                  <p className="text-sm font-semibold">Không tìm thấy sản phẩm/dịch vụ nào khớp bộ lọc.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCatalog.map((item, idx) => {
                    const isProduct = catalogType === "product"
                    const id = isProduct ? (item as RankedProduct).productId : (item as RankedService).serviceId
                    const name = isProduct ? (item as RankedProduct).productName : (item as RankedService).serviceName
                    const sub = item.shopName
                    const img = isProduct ? (item as RankedProduct).imageUrl : (Array.isArray((item as RankedService).imageUrl) ? ((item as RankedService).imageUrl as string[])[0] : ((item as RankedService).imageUrl as string || DEFAULT_SHOP_AVATAR))
                    const stock = isProduct ? (item as RankedProduct).stockQuantity : undefined
                    const soldStr = isProduct ? `${(item as RankedProduct).sold || 0} đã bán` : `${(item as RankedService).bookings || 0} đặt lịch`
                    const revenueStr = formatCurrency(isProduct ? ((item as RankedProduct).revenue || 0) : ((item as RankedService).revenue || 0))
                    
                    const isPending = item.status === "pending"

                    return (
                      <Card key={`${id}-${idx}`} className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                        {isPending && (
                          <div className="absolute top-2 left-2 z-10">
                            <Badge className="bg-amber-500 text-white border-none text-[10px] font-bold">Chờ duyệt bán</Badge>
                          </div>
                        )}

                        <div className="relative h-44 bg-slate-100 shrink-0">
                          <img src={img || "/placeholder.png"} alt={name} className="object-cover h-full w-full" />
                        </div>

                        <CardContent className="p-4 flex-grow flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1f6654]">{sub}</p>
                            <h3 className="font-bold text-slate-800 line-clamp-2 text-sm h-10" title={name}>{name}</h3>
                          </div>

                          <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-xs">
                            <div>
                              <p className="text-[9px] text-slate-400">Doanh thu thô</p>
                              <p className="font-bold text-[#1f6654]">{revenueStr}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-slate-400">{soldStr}</p>
                              {stock !== undefined && <p className="font-medium text-slate-600">Kho: {stock}</p>}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {isPending ? (
                              <Button size="sm" className="w-full bg-[#1f6654] hover:bg-[#154639] text-white text-xs font-semibold h-8" onClick={() => handleApproveProduct(id)}>
                                Phê duyệt bán
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" className="w-full text-slate-500 border-[#cbdad4] text-xs h-8 cursor-default hover:bg-transparent">
                                Đang hoạt động
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: ORDER MANAGEMENT (QUẢN LÝ ĐƠN HÀNG) */}
          {/* ==================================================== */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#cbdad4] pb-4">
                <div>
                  <h1 className="text-xl font-bold text-[#18352e]">Theo Dõi Đơn Hàng</h1>
                  <p className="text-xs text-slate-500">Giám sát lộ trình đơn, tiến hành duyệt, bàn giao vận chuyển và hủy/hoàn trả nếu xảy ra sự cố.</p>
                </div>

                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Tìm mã đơn, khách, shop..." 
                    className="pl-9 h-10 border-[#cbdad4]"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Sub tabs by Order Status */}
              <div className="flex flex-wrap gap-2">
                <OrderSubTabBtn active={orderSubTab === "all"} label="Tất cả" onClick={() => setOrderSubTab("all")} />
                <OrderSubTabBtn active={orderSubTab === "pending"} label="Đơn mới / Chờ duyệt" onClick={() => setOrderSubTab("pending")} count={orders.filter(o => o.status === "pending" || o.status === "cho xu ly").length} />
                <OrderSubTabBtn active={orderSubTab === "processing"} label="Đang xử lý" onClick={() => setOrderSubTab("processing")} count={orders.filter(o => o.status === "processing").length} />
                <OrderSubTabBtn active={orderSubTab === "shipping"} label="Đang giao" onClick={() => setOrderSubTab("shipping")} count={orders.filter(o => o.status === "shipping").length} />
                <OrderSubTabBtn active={orderSubTab === "completed"} label="Hoàn thành" onClick={() => setOrderSubTab("completed")} />
                <OrderSubTabBtn active={orderSubTab === "cancelled"} label="Đã hủy" onClick={() => setOrderSubTab("cancelled")} />
              </div>

              {/* Order Cards */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl bg-slate-50 text-slate-400">
                  <ClipboardList className="mx-auto h-12 w-12 opacity-60 mb-2" />
                  <p className="text-sm font-semibold">Không tìm thấy đơn hàng nào thuộc danh mục này.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const normStatus = order.status.toLowerCase()
                    return (
                      <div key={order.orderId} className="rounded-xl border border-[#e6efea] bg-white p-5 hover:shadow-sm transition-shadow">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#1f6654] text-sm">Đơn: #{order.orderId.substring(0, 8).toUpperCase()}</p>
                            <span className="text-xs text-slate-400">|</span>
                            <p className="text-xs font-semibold text-slate-600">Khách: {order.customerName}</p>
                          </div>
                          
                          <StatusBadge status={order.status} />
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-4 items-center">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Gian hàng tham gia</p>
                            <p className="text-xs font-bold text-slate-700 truncate mt-0.5">{order.shopNames.join(", ")}</p>
                          </div>
                          
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Giá trị đơn hàng</p>
                            <p className="text-sm font-bold text-[#1f6654] mt-0.5">{formatCurrency(order.totalAmount)}</p>
                          </div>

                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Thời gian mua</p>
                            <p className="text-xs font-medium text-slate-600 mt-0.5">{formatDate(order.createdAt)}</p>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="h-8 text-xs border-[#cbdad4]" onClick={() => setSelectedOrder(order)}>
                              Xem Chi Tiết
                            </Button>

                            {/* Processing button progression */}
                            {(normStatus === "pending" || normStatus === "cho xu ly") && (
                              <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium" onClick={() => handleProgressOrder(order.orderId, "processing")}>
                                Duyệt đơn
                              </Button>
                            )}

                            {normStatus === "processing" && (
                              <Button size="sm" className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white font-medium" onClick={() => handleProgressOrder(order.orderId, "shipping")}>
                                Giao hàng
                              </Button>
                            )}

                            {normStatus === "shipping" && (
                              <Button size="sm" className="h-8 text-xs bg-[#1f6654] hover:bg-[#154639] text-white font-medium" onClick={() => handleProgressOrder(order.orderId, "completed")}>
                                Hoàn thành đơn
                              </Button>
                            )}

                            {normStatus !== "completed" && normStatus !== "cancelled" && normStatus !== "da huy" && normStatus !== "hoan thanh" && (
                              <Button size="sm" variant="destructive" className="h-8 text-xs font-medium bg-rose-600 hover:bg-rose-700" onClick={() => handleCancelOrder(order.orderId)}>
                                Hủy đơn
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 6: REVIEWS & FEEDBACK (ĐÁNH GIÁ & PHẢN HỒI) */}
          {/* ==================================================== */}
          {activeTab === "feedback" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#cbdad4] pb-4">
                <div>
                  <h1 className="text-xl font-bold text-[#18352e]">Đánh Giá & Khiếu Nại Phản Hồi</h1>
                  <p className="text-xs text-slate-500">Giám sát chất lượng dịch vụ đa shop, can thiệp ẩn đánh giá vi phạm hoặc đưa ra lời nhắc nhở xử lý shop tiêu cực.</p>
                </div>

                <Select value={reviewFilter} onValueChange={setReviewFilter}>
                  <SelectTrigger className="w-48 border-[#cbdad4]">
                    <SelectValue placeholder="Phân loại đánh giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả đánh giá</SelectItem>
                    <SelectItem value="negative">Đánh giá tiêu cực (≤3⭐)</SelectItem>
                    <SelectItem value="positive">Đánh giá tích cực (≥4⭐)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Review Statistics Header */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-4 bg-emerald-50/20 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#1f6654] tracking-wider">Đánh Giá Trung Bình</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">⭐ {overview.averageRating}/5</p>
                  </div>
                  <ThumbsUp className="h-8 w-8 text-[#1f6654] opacity-80" />
                </Card>

                <Card className="p-4 bg-rose-50/20 border border-rose-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Báo cáo cảnh báo tiêu cực</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{reviews.length} mục cần xử lý</p>
                  </div>
                  <ThumbsDown className="h-8 w-8 text-rose-500 opacity-80" />
                </Card>

                <Card className="p-4 bg-sky-50/20 border border-sky-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-sky-700 tracking-wider">Tỉ lệ hài lòng khách hàng</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">92.4%</p>
                  </div>
                  <Percent className="h-8 w-8 text-sky-500 opacity-80" />
                </Card>
              </div>

              {/* Reviews List */}
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl bg-slate-50 text-slate-400">
                  <Star className="mx-auto h-12 w-12 opacity-60 mb-2" />
                  <p className="text-sm font-semibold">Chưa có phản hồi tiêu cực nào cần xử lý lúc này.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredReviews.map((rev) => (
                    <Card key={rev.reviewId} className={`p-4 border shadow-sm ${rev.rating <= 3 ? "border-rose-200 bg-[#fffafb]" : "border-[#e6efea] bg-white"}`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={`${rev.rating <= 3 ? "bg-rose-50 text-rose-700 hover:bg-rose-50" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"}`}>
                              {rev.type === "product" ? "Sản phẩm" : "Dịch vụ"}
                            </Badge>
                            <span className="flex items-center gap-0.5 text-sm font-bold text-amber-500">
                              {"★".repeat(rev.rating)}
                              {"☆".repeat(5 - rev.rating)}
                            </span>
                            <span className="text-xs text-slate-400">·</span>
                            <p className="text-xs font-semibold text-slate-500 truncate">Shop: {rev.shopName}</p>
                          </div>
                          
                          <p className="font-bold text-slate-800 text-sm mt-2">Mục: {rev.targetName}</p>
                          <p className="text-xs leading-relaxed text-slate-600 italic bg-white/50 p-2.5 rounded-lg border border-slate-100">
                            &ldquo;{rev.comment || "Khách hàng không để lại bình luận."}&rdquo;
                          </p>
                          <p className="text-[10px] text-slate-400">{rev.customerName} · {formatDate(rev.createdAt)}</p>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0 justify-end items-end">
                          {rev.rating <= 3 && (
                            <>
                              <Button size="sm" className="h-8 text-xs font-medium bg-[#1f6654] hover:bg-[#154639]" onClick={() => setReplyReviewId(rev.reviewId)}>
                                Phản hồi khách / Shop
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 text-xs font-medium text-rose-600 border-rose-200 hover:bg-rose-50/50" onClick={() => handleResolveReview(rev.reviewId)}>
                                Ẩn / Đóng khiếu nại
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Reply Input block */}
                      {replyReviewId === rev.reviewId && (
                        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Viết phản hồi hỗ trợ điều phối</p>
                          <Input 
                            placeholder="Nhập câu trả lời hoặc yêu cầu đối soát gửi đến Shop vi phạm..."
                            value={reviewReplyText}
                            onChange={(e) => setReviewReplyText(e.target.value)}
                            className="bg-white border-[#cbdad4] text-xs h-9"
                          />
                          <div className="flex justify-end gap-2 pt-1">
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setReplyReviewId(null)}>Hủy</Button>
                            <Button size="sm" className="h-7 text-xs bg-[#1f6654] hover:bg-[#154639]" onClick={() => handleSendReviewReply(rev.reviewId)}>Gửi</Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 7: PAYMENTS & COMMISSION (THANH TOÁN & HOA HỒNG) */}
          {/* ==================================================== */}
          {activeTab === "finance" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-[#18352e]">Thanh Toán & Hoa Hồng Nền Tảng</h1>
                  <p className="text-xs text-slate-500">Đối soát hoa hồng hệ thống (10%) và hoàn thành chi trả số dư thực nhận còn lại cho các shop thú cưng.</p>
                </div>
              </div>

              {/* financial metrics */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="p-4 bg-emerald-50/20 border border-emerald-100">
                  <p className="text-[10px] uppercase font-bold text-[#1f6654] tracking-wider">Doanh thu thô hệ thống</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(finance.grossRevenue)}</p>
                  <p className="text-[9px] text-slate-400 mt-1">Tổng tiền thanh toán từ đơn hàng & dịch vụ</p>
                </Card>

                <Card className="p-4 bg-purple-50/20 border border-purple-100">
                  <p className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Hoa hồng nền tảng (10%)</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(finance.platformFee)}</p>
                  <p className="text-[9px] text-slate-400 mt-1">Thu nhập giữ lại chi phí duy trì vận hành</p>
                </Card>

                <Card className="p-4 bg-sky-50/20 border border-sky-100">
                  <p className="text-[10px] uppercase font-bold text-sky-700 tracking-wider">Thực nhận trả Shop (90%)</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(finance.netPayout)}</p>
                  <p className="text-[9px] text-slate-400 mt-1">Tổng quỹ tích lũy đang trong hạn đối soát</p>
                </Card>

                <Card className="p-4 bg-slate-50 border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Số lượng giao dịch</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{finance.transactions} lượt</p>
                  <p className="text-[9px] text-slate-400 mt-1">Đơn đặt hàng & Lịch đặt spa/thú y</p>
                </Card>
              </div>

              {/* Shops Revenue & Payout matching */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-[#18352e] flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#1f6654]" />
                    Đối Soát Số Dư Chi Trả Từng Shop
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f7faf8] text-[#557068] font-bold border-y border-slate-100">
                      <tr>
                        <th className="p-4">Tên Shop Thú Cưng</th>
                        <th className="p-4">Doanh Thu Thô</th>
                        <th className="p-4">Phí Hệ Thống (10%)</th>
                        <th className="p-4">Doanh Thu Thực Nhận</th>
                        <th className="p-4 text-center">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {shops.map((shop) => {
                        const fee = Math.round(shop.revenue * 0.1)
                        const net = Math.round(shop.revenue * 0.9)
                        
                        // Link state with transaction payout status
                        const linkedTx = transactions.find(t => t.shopName === shop.shopName)
                        const isPaid = linkedTx ? linkedTx.status === "completed" : true

                        return (
                          <tr key={shop.shopId} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-700">{shop.shopName}</td>
                            <td className="p-4 font-medium text-slate-600">{formatCurrency(shop.revenue)}</td>
                            <td className="p-4 text-purple-600 font-semibold">{formatCurrency(fee)}</td>
                            <td className="p-4 text-[#1f6654] font-bold">{formatCurrency(net)}</td>
                            <td className="p-4 text-center">
                              {isPaid ? (
                                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Đã thanh toán</Badge>
                              ) : (
                                <Button 
                                  size="sm" 
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[10px] h-7 px-3"
                                  onClick={() => {
                                    if (linkedTx) handlePayShop(linkedTx.txId)
                                  }}
                                >
                                  Chuyển khoản (90%)
                                </Button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Transactions History log */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-[#18352e] flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-500" />
                    Lịch Sử Giao Dịch Chuyển Khoản Shop Gần Đây
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-100">
                      <tr>
                        <th className="p-4">Mã Giao Dịch</th>
                        <th className="p-4">Đơn Vị Thụ Hưởng</th>
                        <th className="p-4">Số Tiền Thực Chuyển</th>
                        <th className="p-4">Thời Gian Thanh Toán</th>
                        <th className="p-4">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((tx) => (
                        <tr key={tx.txId} className="hover:bg-slate-50/50">
                          <td className="p-4 font-mono font-semibold text-slate-500">{tx.txId}</td>
                          <td className="p-4 font-semibold text-slate-700">{tx.shopName}</td>
                          <td className="p-4 font-bold text-slate-800">{formatCurrency(tx.amount - tx.fee)}</td>
                          <td className="p-4 text-slate-500">{formatDate(tx.date)}</td>
                          <td className="p-4">
                            <Badge className={tx.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                              {tx.status === "completed" ? "Đã đối soát" : "Đang chờ duyệt"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 8: STATS & CHARTS (THỐNG KÊ & BIỂU ĐỒ) */}
          {/* ==================================================== */}
          {activeTab === "charts" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-[#18352e]">Thống Kê Doanh Thu & Hiệu Suất Hệ Thống</h1>
                <p className="text-xs text-slate-500">Phân tích chuyên sâu về dữ liệu tài chính, hiệu suất của từng shop và hành vi người tiêu dùng.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Chart 1: Doanh thu theo tháng */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-[#1f6654]" />
                      Biến Động Doanh Thu 6 Tháng Gần Nhất
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.charts.revenueByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1f6654" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#1f6654" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="#8ba29a" />
                        <YAxis tickFormatter={(val) => `${Math.round(val / 1000000)}M`} tickLine={false} axisLine={false} fontSize={11} stroke="#8ba29a" />
                        <RechartsTooltip formatter={(val: number) => [formatCurrency(val), "Doanh thu"]} />
                        <Area type="monotone" dataKey="revenue" stroke="#1f6654" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Chart 2: Top shop doanh thu cao */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Store className="h-4 w-4 text-purple-600" />
                      Xếp Hạng Doanh Thu Các Shop Đầu Bảng (M đ)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={shops.slice(0, 5)} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f3" />
                        <XAxis type="number" tickFormatter={(val) => `${Math.round(val / 1000000)}M`} tickLine={false} axisLine={false} fontSize={11} stroke="#8ba29a" />
                        <YAxis dataKey="shopName" type="category" tickLine={false} axisLine={false} fontSize={10} width={80} stroke="#8ba29a" />
                        <RechartsTooltip formatter={(val: number) => [formatCurrency(val), "Doanh thu"]} />
                        <Bar dataKey="revenue" fill="#7c3aed" radius={[0, 4, 4, 0]} barSize={16}>
                          {shops.slice(0, 5).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "#1f6654" : "#7c3aed"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Chart 3: Trạng thái đơn hàng cơ cấu */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <ClipboardList className="h-4 w-4 text-sky-600" />
                      Cơ Cấu Trạng Thái Đơn Hàng Hệ Thống
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[260px] flex items-center justify-center">
                    <div className="w-[50%] h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={data.charts.orderStatus} 
                            dataKey="value" 
                            nameKey="label" 
                            innerRadius={50} 
                            outerRadius={80} 
                            paddingAngle={3}
                          >
                            {data.charts.orderStatus.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-[50%] space-y-2 px-4">
                      {data.charts.orderStatus.map((entry, index) => (
                        <div key={entry.label} className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors[index % statusColors.length] }} />
                            {entry.label}
                          </span>
                          <strong className="text-slate-800">{entry.value} đơn</strong>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Chart 4: Địa lý khách hàng */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[#b44735]" />
                      Bản Đồ Phân Bố Khu Vực Có Nhiều Khách Hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={[
                          { region: "Hà Nội", count: 124 },
                          { region: "TP. HCM", count: 185 },
                          { region: "Đà Nẵng", count: 48 },
                          { region: "Hải Phòng", count: 32 },
                          { region: "Cần Thơ", count: 26 }
                        ]} 
                        margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
                        barSize={24}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
                        <XAxis dataKey="region" tickLine={false} axisLine={false} fontSize={11} stroke="#8ba29a" />
                        <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#8ba29a" />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill="#b44735" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 9: SUPPORT & TICKET SYSTEM (HỖ TRỢ & KHIẾU NẠI) */}
          {/* ==================================================== */}
          {activeTab === "support" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#cbdad4] pb-4">
                <div>
                  <h1 className="text-xl font-bold text-[#18352e]">Trung Tâm Hỗ Trợ & Xử Lý Tranh Chấp</h1>
                  <p className="text-xs text-slate-500">Lắng nghe phản hồi từ khách hàng và đối tác shop. Đóng vai trò trọng tài xử lý tranh chấp đơn hàng công minh.</p>
                </div>

                <Select value={ticketFilter} onValueChange={setTicketFilter}>
                  <SelectTrigger className="w-48 border-[#cbdad4]">
                    <SelectValue placeholder="Trạng thái hỗ trợ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả ticket</SelectItem>
                    <SelectItem value="open">Đang mở (chờ phản hồi)</SelectItem>
                    <SelectItem value="processing">Đang xử lý</SelectItem>
                    <SelectItem value="resolved">Đã giải quyết</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tickets list */}
              {filteredTickets.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl bg-slate-50 text-slate-400">
                  <HelpCircle className="mx-auto h-12 w-12 opacity-60 mb-2" />
                  <p className="text-sm font-semibold">Tuyệt vời! Không có ticket hỗ trợ nào đang mở.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTickets.map((t) => (
                    <Card key={t.ticketId} className={`p-4 border shadow-sm ${t.status === "open" ? "border-amber-200 bg-amber-50/10" : "border-slate-100 bg-white"}`}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="font-mono bg-slate-100 text-slate-700 hover:bg-slate-100">{t.ticketId}</Badge>
                            <Badge className={t.creatorRole === "shop" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-sky-50 text-sky-700 hover:bg-sky-50"}>
                              {t.creatorRole === "shop" ? "Cửa hàng" : "Khách hàng"}
                            </Badge>
                            <span className="text-xs font-semibold text-slate-400">Tạo bởi: {t.creatorName}</span>
                            <span className="text-xs text-slate-300">·</span>
                            <span className="text-xs text-slate-400">{formatDate(t.createdAt)}</span>
                          </div>

                          <h3 className="font-bold text-slate-800 text-sm mt-2">{t.title}</h3>
                          <p className="text-xs text-slate-600 leading-relaxed bg-white/60 p-2.5 rounded-lg border border-slate-100">
                            {t.description}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0 items-end">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-500">Trạng thái:</span>
                            <Badge className={t.status === "open" ? "bg-amber-100 text-amber-800" : t.status === "processing" ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-800"}>
                              {t.status === "open" ? "Chờ duyệt" : t.status === "processing" ? "Đang xử lý" : "Đã xong"}
                            </Badge>
                          </div>
                          
                          <Button size="sm" className="h-8 text-xs font-semibold bg-[#1f6654] hover:bg-[#154639] text-white mt-1" onClick={() => setSelectedTicket(t)}>
                            {t.category === "dispute" ? "Xử lý tranh chấp" : "Mở phản hồi"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 10: NOTIFICATIONS CENTER (TRUNG TÂM THÔNG BÁO) */}
          {/* ==================================================== */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#cbdad4] pb-4">
                <div>
                  <h1 className="text-xl font-bold text-[#18352e]">Trung Tâm Điều Phối Thông Báo</h1>
                  <p className="text-xs text-slate-500">Kiểm tra các hoạt động mới phát sinh tự động trên toàn hệ thống.</p>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={notificationFilter} onValueChange={setNotificationFilter}>
                    <SelectTrigger className="w-40 border-[#cbdad4]">
                      <SelectValue placeholder="Mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả mức độ</SelectItem>
                      <SelectItem value="critical">Khẩn cấp</SelectItem>
                      <SelectItem value="warning">Cảnh báo</SelectItem>
                      <SelectItem value="success">Thành công</SelectItem>
                      <SelectItem value="info">Thông tin</SelectItem>
                    </SelectContent>
                  </Select>

                  {notifications.length > 0 && (
                    <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs font-semibold h-10" onClick={handleMarkAllNotificationsRead}>
                      Xóa tất cả ({notifications.length})
                    </Button>
                  )}
                </div>
              </div>

              {/* Notifications rows */}
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl bg-slate-50 text-slate-400">
                  <BellRing className="mx-auto h-12 w-12 opacity-60 mb-2" />
                  <p className="text-sm font-semibold">Hộp thư thông báo trống.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((item, index) => (
                    <div key={`${item.title}-${index}`} className={`rounded-xl border p-4 hover:shadow-sm transition-all flex items-start justify-between gap-3 ${toneClassName[item.tone] || toneClassName.info}`}>
                      <div className="flex gap-3 min-w-0">
                        <div className="h-2 w-2 rounded-full bg-current shrink-0 mt-2 animate-pulse" />
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-800">{item.title}</p>
                          <p className="mt-1 text-xs opacity-90 leading-relaxed text-slate-600">{item.description}</p>
                          <p className="mt-2 text-[10px] opacity-70 flex items-center gap-1 font-semibold">
                            <Clock className="h-3 w-3" /> {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>

                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full opacity-60 hover:opacity-100 hover:bg-black/5" onClick={() => handleMarkNotificationRead(index)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ==================================================== */}
      {/* DIALOGS SECTION */}
      {/* ==================================================== */}

      {/* 1. Shop details dialog */}
      <Dialog open={selectedShop !== null} onOpenChange={(open) => !open && setSelectedShop(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl">
          {selectedShop && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Store className="h-5 w-5 text-[#1f6654]" />
                  Hồ Sơ Cửa Hàng: {selectedShop.shopName}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Mã định danh shop: {selectedShop.shopId}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-5 pt-3">
                <div className="flex gap-4 items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage src={getAvatarUrl(selectedShop.shopImageUrl, DEFAULT_SHOP_AVATAR)} alt={selectedShop.shopName} />
                    <AvatarFallback>
                      <img src={DEFAULT_SHOP_AVATAR} className="h-full w-full object-cover" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800">{selectedShop.shopName}</h4>
                      <StatusBadge status={selectedShop.status} />
                    </div>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Đăng ký ngày: {formatDate(selectedShop.createdAt)}</p>
                    <p className="text-xs text-amber-600 font-bold mt-0.5">⭐ {selectedShop.rating}/5.0 (Đánh giá TB)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <p className="font-bold text-slate-800">Thông tin liên hệ</p>
                    <p className="text-slate-600 font-medium">Chủ shop: <span className="text-slate-800 font-bold">{selectedShop.ownerName}</span></p>
                    <p className="text-slate-600 font-medium">Email liên hệ: <span className="text-slate-800 font-bold">{selectedShop.ownerEmail}</span></p>
                    <p className="text-slate-600 font-medium">Số điện thoại: <span className="text-[#1f6654] font-bold">{selectedShop.phoneNumber || "N/A"}</span></p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-slate-800">Vị trí địa lý</p>
                    <p className="text-slate-600 font-medium">Khu vực: <span className="text-slate-800 font-bold">{selectedShop.location}</span></p>
                    <p className="text-slate-600 font-medium leading-relaxed">Địa chỉ cụ thể: <span className="text-slate-800 font-semibold">{selectedShop.address || "N/A"}</span></p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-slate-800">Doanh thu & Sản phẩm</p>
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="bg-[#f7faf8] p-3 rounded-lg border border-[#e6efea]">
                      <p className="text-slate-400 font-semibold">Tích lũy doanh thu</p>
                      <p className="text-base font-bold text-[#1f6654] mt-1">{formatCurrency(selectedShop.revenue)}</p>
                    </div>
                    <div className="bg-[#f7faf8] p-3 rounded-lg border border-[#e6efea]">
                      <p className="text-slate-400 font-semibold">Mặt hàng kinh doanh</p>
                      <p className="text-base font-bold text-slate-800 mt-1">{selectedShop.productCount} SP</p>
                    </div>
                    <div className="bg-[#f7faf8] p-3 rounded-lg border border-[#e6efea]">
                      <p className="text-slate-400 font-semibold">Tổng giao dịch hàng</p>
                      <p className="text-base font-bold text-[#4766cc] mt-1">{selectedShop.orderCount} đơn</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
                <div className="flex gap-2 w-full justify-between">
                  <div>
                    {selectedShop.status === "pending" && (
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 px-4" onClick={() => handleApproveShop(selectedShop.shopId)}>
                        Phê Duyệt Hoạt Động
                      </Button>
                    )}
                    {selectedShop.status === "active" && (
                      <Button variant="destructive" className="bg-rose-600 hover:bg-rose-700 font-medium text-xs h-9 px-4" onClick={() => handleLockShop(selectedShop.shopId)}>
                        Khóa Gian Hàng
                      </Button>
                    )}
                    {selectedShop.status === "locked" && (
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-9 px-4" onClick={() => handleUnlockShop(selectedShop.shopId)}>
                        Mở Khóa Hoạt Động
                      </Button>
                    )}
                  </div>
                  <Button variant="outline" className="text-xs h-9 px-4" onClick={() => setSelectedShop(null)}>
                    Đóng cửa sổ
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Customer details dialog */}
      <Dialog open={selectedCustomer !== null} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-[#b44735]" />
                  Hồ Sơ Khách Hàng: {selectedCustomer.fullName}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Đăng ký tài khoản từ ngày: {formatDate(selectedCustomer.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 pt-3 text-xs">
                <div className="flex gap-4 items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage src={getAvatarUrl(selectedCustomer.profilePictureUrl, DEFAULT_USER_AVATAR)} alt={selectedCustomer.fullName} />
                    <AvatarFallback>
                      <img src={DEFAULT_USER_AVATAR} className="h-full w-full object-cover" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{selectedCustomer.fullName}</h4>
                    <p className="text-slate-500 font-semibold mt-1">Hòm thư: {selectedCustomer.email}</p>
                    <p className="text-slate-500 font-semibold mt-0.5">Số điện thoại: {selectedCustomer.phoneNumber || "N/A"}</p>
                    <p className="text-slate-400 mt-1 truncate max-w-md flex items-center gap-0.5">
                      <MapPin className="h-3 w-3 shrink-0" /> Địa chỉ giao: {selectedCustomer.address || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#fcf8f7] p-3 rounded-lg border border-[#f5e6e3]">
                    <p className="text-slate-400">Sản phẩm đã mua</p>
                    <p className="text-base font-bold text-slate-800 mt-1">{selectedCustomer.orderCount} đơn hàng</p>
                  </div>
                  <div className="bg-[#f5f8ff] p-3 rounded-lg border border-[#e2eafc]">
                    <p className="text-slate-400">Đặt dịch vụ (Spa/Y tế)</p>
                    <p className="text-base font-bold text-[#4766cc] mt-1">{selectedCustomer.bookingCount} lượt</p>
                  </div>
                  <div className="bg-[#f4faf6] p-3 rounded-lg border border-[#d6e9dd]">
                    <p className="text-slate-400">Chi tiêu tích lũy</p>
                    <p className="text-base font-bold text-[#1f6654] mt-1">{formatCurrency(selectedCustomer.totalSpent)}</p>
                  </div>
                </div>

                <Separator />

                {/* Purchase history simulated */}
                <div className="space-y-2.5">
                  <p className="font-bold text-slate-800">Lịch sử giao dịch mua sắm</p>
                  <div className="border rounded-lg divide-y divide-slate-100 overflow-hidden bg-slate-50/50">
                    <div className="p-3 bg-slate-50 font-bold grid grid-cols-3 text-slate-500">
                      <span>Loại hình giao dịch</span>
                      <span>Mã / Thời gian</span>
                      <span className="text-right">Giá trị hóa đơn</span>
                    </div>
                    <div className="p-3 grid grid-cols-3 items-center">
                      <span className="font-semibold text-slate-700">🛒 Mua thức ăn, phụ kiện</span>
                      <div className="flex flex-col">
                        <span className="font-mono text-slate-500">#ORD-5531</span>
                        <span className="text-[10px] text-slate-400">10/05/2026</span>
                      </div>
                      <span className="text-right font-bold text-slate-800">{formatCurrency(selectedCustomer.totalSpent * 0.6)}</span>
                    </div>
                    <div className="p-3 grid grid-cols-3 items-center">
                      <span className="font-semibold text-[#4766cc]">💇 Dịch vụ tắm tỉa lông mèo</span>
                      <div className="flex flex-col">
                        <span className="font-mono text-slate-500">#BK-9021</span>
                        <span className="text-[10px] text-slate-400">22/05/2026</span>
                      </div>
                      <span className="text-right font-bold text-slate-800">{formatCurrency(selectedCustomer.totalSpent * 0.4)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t">
                <Button className="bg-[#1f6654] hover:bg-[#154639] text-white text-xs font-semibold h-9 px-4" onClick={() => setSelectedCustomer(null)}>
                  Đóng hồ sơ
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. Order details dialog */}
      <Dialog open={selectedOrder !== null} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-[#1f6654]" />
                  Chi Tiết Đơn Hàng: #{selectedOrder.orderId.substring(0, 8).toUpperCase()}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Ghi nhận lúc: {formatDate(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 pt-3 text-xs">
                {/* Status and totals */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Tình trạng đơn hàng</p>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusBadge status={selectedOrder.status} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Tổng số tiền</p>
                    <p className="text-lg font-bold text-[#1f6654] mt-0.5">{formatCurrency(selectedOrder.totalAmount)}</p>
                  </div>
                </div>

                {/* Shops & Customer info */}
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div className="p-3 border rounded-xl space-y-1.5 bg-[#f4faf6]/30 border-[#e6efea]">
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <Store className="h-4 w-4 text-[#1f6654]" /> Đối tác bán hàng
                    </p>
                    <p className="text-slate-600 font-medium">Các shop: <span className="text-slate-800 font-bold">{selectedOrder.shopNames.join(", ")}</span></p>
                    <p className="text-[10px] text-slate-400">Doanh thu tạm tính đã được ghi giữ lại trong ví đảm bảo trung gian.</p>
                  </div>

                  <div className="p-3 border rounded-xl space-y-1.5 bg-sky-50/20 border-sky-100">
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <UserRound className="h-4 w-4 text-sky-600" /> Khách hàng mua sắm
                    </p>
                    <p className="text-slate-600 font-medium">Họ tên: <span className="text-slate-800 font-bold">{selectedOrder.customerName}</span></p>
                    <p className="text-slate-600 font-medium leading-relaxed">Địa điểm nhận hàng: <span className="text-slate-800 font-medium">Hà Nội, Việt Nam</span></p>
                  </div>
                </div>

                {/* Items details simulated list */}
                <div className="space-y-2">
                  <p className="font-bold text-slate-800">Danh mục sản phẩm trong đơn</p>
                  <div className="border rounded-xl divide-y divide-slate-100 overflow-hidden bg-slate-50/50">
                    <div className="p-3 bg-slate-50 font-bold grid grid-cols-4 text-slate-500">
                      <span className="col-span-2">Mặt hàng</span>
                      <span className="text-center">Số lượng</span>
                      <span className="text-right">Thành tiền</span>
                    </div>

                    <div className="p-3 grid grid-cols-4 items-center">
                      <div className="col-span-2 flex items-center gap-2">
                        <div className="h-10 w-10 bg-slate-100 border rounded overflow-hidden">
                          <img src="/placeholder.png" alt="item" className="object-cover h-full w-full" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">Thức ăn hạt cho chó con (Royal Canin)</p>
                          <p className="text-[10px] text-[#1f6654]">Cung cấp bởi: Pet Mart</p>
                        </div>
                      </div>
                      <span className="text-center font-bold text-slate-700">x{selectedOrder.itemCount || 1}</span>
                      <span className="text-right font-bold text-slate-800">{formatCurrency(selectedOrder.totalAmount * 0.7)}</span>
                    </div>

                    <div className="p-3 grid grid-cols-4 items-center">
                      <div className="col-span-2 flex items-center gap-2">
                        <div className="h-10 w-10 bg-slate-100 border rounded overflow-hidden">
                          <img src="/placeholder.png" alt="item" className="object-cover h-full w-full" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">Dây dắt chó đi dạo cao cấp</p>
                          <p className="text-[10px] text-[#1f6654]">Cung cấp bởi: Mimi Pet Shop</p>
                        </div>
                      </div>
                      <span className="text-center font-bold text-slate-700">x1</span>
                      <span className="text-right font-bold text-slate-800">{formatCurrency(selectedOrder.totalAmount * 0.3)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t">
                <div className="flex gap-2 w-full justify-between">
                  <div className="flex gap-2">
                    {/* Progression button inside detail */}
                    {(selectedOrder.status.toLowerCase() === "pending" || selectedOrder.status.toLowerCase() === "cho xu ly") && (
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 px-3" onClick={() => handleProgressOrder(selectedOrder.orderId, "processing")}>
                        Duyệt Đơn Hàng
                      </Button>
                    )}

                    {selectedOrder.status.toLowerCase() === "processing" && (
                      <Button className="bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs h-9 px-3" onClick={() => handleProgressOrder(selectedOrder.orderId, "shipping")}>
                        Bàn Giao Vận Chuyển
                      </Button>
                    )}

                    {selectedOrder.status.toLowerCase() === "shipping" && (
                      <Button className="bg-[#1f6654] hover:bg-[#154639] text-white font-medium text-xs h-9 px-3" onClick={() => handleProgressOrder(selectedOrder.orderId, "completed")}>
                        Giao Thành Công
                      </Button>
                    )}

                    {selectedOrder.status.toLowerCase() !== "completed" && selectedOrder.status.toLowerCase() !== "cancelled" && selectedOrder.status.toLowerCase() !== "da huy" && selectedOrder.status.toLowerCase() !== "hoan thanh" && (
                      <Button variant="destructive" className="bg-rose-600 hover:bg-rose-700 font-medium text-xs h-9 px-3" onClick={() => handleCancelOrder(selectedOrder.orderId)}>
                        Hủy & Hoàn Tiền
                      </Button>
                    )}
                  </div>
                  <Button variant="outline" className="text-xs h-9 px-4" onClick={() => setSelectedOrder(null)}>
                    Đóng
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 4. Ticket dispute / resolution dialog */}
      <Dialog open={selectedTicket !== null} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl flex flex-col justify-between">
          {selectedTicket && (
            <>
              <DialogHeader className="shrink-0">
                <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#1f6654]" />
                  Chi Tiết Ticket #{selectedTicket.ticketId}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Chủ đề tranh chấp: {selectedTicket.title}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-3 text-xs overflow-y-auto flex-grow max-h-[45vh] pr-2">
                <div className="p-3 bg-slate-50 border rounded-xl space-y-1 bg-[#f4faf6]/30 border-[#e6efea]">
                  <p className="font-bold text-slate-800">Nội dung yêu cầu ban đầu:</p>
                  <p className="text-slate-600 mt-1 leading-relaxed text-xs">{selectedTicket.description}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Tạo bởi: {selectedTicket.creatorName} ({selectedTicket.creatorRole === "shop" ? "Cửa hàng" : "Khách hàng"})</p>
                </div>

                {/* Message logs */}
                <div className="space-y-3">
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Nhật ký xử lý tranh chấp</p>
                  
                  {selectedTicket.messages.map((m, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border flex gap-3 ${m.sender === "admin" ? "bg-slate-100/70 border-slate-200" : "bg-white border-slate-150 ml-4 shadow-sm"}`}>
                      {m.sender === "admin" ? (
                        <div className="h-7 w-7 rounded-full bg-[#1f6654] text-white flex items-center justify-center font-bold text-[9px] shrink-0">AD</div>
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[9px] shrink-0">USER</div>
                      )}
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 text-xs">{m.senderName}</p>
                          <span className="text-[9px] text-slate-400">{formatDate(m.createdAt)}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{m.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution options and chat message typing */}
              <div className="pt-4 border-t shrink-0 space-y-3">
                {selectedTicket.status !== "resolved" && (
                  <>
                    {/* Quick dispute adjudication buttons if dispute */}
                    {selectedTicket.category === "dispute" && (
                      <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                        <p className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" /> Bảng phán quyết trọng tài (Admin)
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-8" onClick={() => handleResolveTicket(selectedTicket.ticketId, "refund")}>
                            Hoàn tiền cho Khách hàng
                          </Button>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8" onClick={() => handleResolveTicket(selectedTicket.ticketId, "payout")}>
                            Giải ngân cho Shop
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Standard Message Form */}
                    <div className="flex gap-2 items-center">
                      <Input 
                        placeholder="Nhập nội dung tin nhắn gửi phản hồi..."
                        value={ticketReply}
                        onChange={(e) => setTicketReply(e.target.value)}
                        className="flex-grow text-xs h-9 border-[#cbdad4]"
                        onKeyDown={(e) => e.key === "Enter" && handleSendTicketReply()}
                      />
                      <Button size="icon" className="bg-[#1f6654] hover:bg-[#154639] h-9 w-9" onClick={handleSendTicketReply}>
                        <Send className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center pt-2">
                  {selectedTicket.status !== "resolved" ? (
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-8" onClick={() => handleResolveTicket(selectedTicket.ticketId)}>
                      Đánh dấu Đã giải quyết
                    </Button>
                  ) : (
                    <Badge className="bg-emerald-50 text-emerald-700">Đã hoàn thành đóng ticket</Badge>
                  )}
                  <Button variant="outline" size="sm" className="text-xs h-8 px-4" onClick={() => setSelectedTicket(null)}>
                    Đóng cửa sổ
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// --- SUB-COMPONENTS FOR CLEANLINESS ---

interface SidebarBtnProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
  badge?: number
  badgeColor?: string
}

function SidebarBtn({ icon, label, active, onClick, badge, badgeColor = "bg-rose-500 text-white" }: SidebarBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200
        ${active 
          ? "bg-[#1f6654] text-white shadow-md shadow-[#1f6654]/10" 
          : "text-[#557068] hover:bg-[#1f6654]/5 hover:text-[#18352e]"
        }
      `}
    >
      <div className="flex items-center gap-2.5">
        <span className={`h-5 w-5 flex items-center justify-center shrink-0 ${active ? "text-white" : "text-[#7b968e]"}`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>

      {badge !== undefined && badge > 0 && (
        <span className={`flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[8px] font-bold ring-2 ring-[#f4faf6] ${badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  )
}

function StatKpiCard({ title, value, detail, icon }: { title: string; value: string | number; detail: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/80 bg-white/80 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#5d766f]">{title}</p>
        <span className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-xl font-bold text-[#17322c]">{value}</p>
      <p className="mt-1 text-[10px] text-[#6e857e] font-medium">{detail}</p>
    </div>
  )
}

function OrderSubTabBtn({ active, label, onClick, count }: { active?: boolean; label: string; onClick: () => void; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 flex items-center gap-1.5
        ${active 
          ? "bg-[#1f6654] text-white border-[#1f6654] shadow-sm" 
          : "bg-white border-[#cbdad4] text-slate-600 hover:bg-slate-50"
        }
      `}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${active ? "bg-white text-[#1f6654]" : "bg-rose-50 text-rose-700"}`}>
          {count}
        </span>
      )}
    </button>
  )
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    locked: "bg-slate-100 text-slate-700 border-slate-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    "cho xu ly": "bg-amber-50 text-amber-700 border-amber-200",
    "processing": "bg-sky-50 text-sky-700 border-sky-200",
    "shipping": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "hoan thanh": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "da huy": "bg-rose-50 text-rose-700 border-rose-200",
  }

  return (
    <Badge className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold hover:bg-transparent ${map[normalized] || "bg-sky-50 text-sky-700 border-sky-200"}`}>
      {statusLabel(normalized)}
    </Badge>
  )
}

function statusLabel(status: string) {
  if (status === "active") return "Đang hoạt động"
  if (status === "pending" || status === "cho xu ly") return "Chờ xử lý"
  if (status === "locked") return "Bị khóa"
  if (status === "completed" || status === "hoan thanh") return "Hoàn thành"
  if (status === "cancelled" || status === "da huy") return "Đã hủy"
  if (status === "processing") return "Đang đóng gói"
  if (status === "shipping") return "Đang giao hàng"
  return status
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} ₫`
}

function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật"
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value))
}
