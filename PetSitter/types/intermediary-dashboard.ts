export interface DashboardOverview {
  activeShops: number
  pendingShops: number
  lockedShops: number
  customers: number
  totalOrders: number
  ordersToday: number
  ordersThisMonth: number
  totalRevenue: number
  completedRate: number
  cancelledRate: number
  returnRate: number
  totalProducts: number
  totalServices: number
  totalBookings: number
  repeatCustomersRate: number
  averageRating: number
  openIssues: number
}

export interface RevenuePoint {
  label: string
  revenue: number
}

export interface ShopSummary {
  shopId: string
  shopName: string
  ownerName: string
  ownerEmail: string
  phoneNumber: string
  address: string
  location: string
  shopImageUrl: string
  productCount: number
  serviceCount: number
  orderCount: number
  revenue: number
  rating: number
  status: "active" | "pending" | "locked" | string
  createdAt: string
}

export interface CustomerSummary {
  userId: string
  fullName: string
  email: string
  phoneNumber: string
  address: string
  profilePictureUrl: string
  orderCount: number
  bookingCount: number
  totalSpent: number
  createdAt: string
  lastOrderAt?: string | null
}

export interface RecentOrderSummary {
  orderId: string
  customerName: string
  totalAmount: number
  status: string
  itemCount: number
  createdAt: string
  shopNames: string[]
}

export interface RankedProduct {
  productId: string
  productName: string
  shopName: string
  imageUrl: string
  sold?: number
  revenue?: number
  stockQuantity?: number
  status?: string
}

export interface RankedService {
  serviceId: string
  serviceName: string
  shopName: string
  imageUrl: string | string[] | null
  bookings: number
  revenue: number
  status: string
}

export interface ReviewAlert {
  reviewId: string
  type: string
  rating: number
  comment: string
  customerName: string
  shopName: string
  targetName: string
  createdAt: string
}

export interface NotificationItem {
  title: string
  description: string
  createdAt: string
  tone: "info" | "success" | "warning" | "critical" | string
}

export interface IntermediaryDashboardData {
  overview: DashboardOverview
  charts: {
    revenueByMonth: RevenuePoint[]
    topShops: ShopSummary[]
    orderStatus: Array<{ label: string; value: number }>
  }
  shops: ShopSummary[]
  customers: CustomerSummary[]
  orders: {
    recent: RecentOrderSummary[]
    pending: number
    completed: number
    cancelled: number
  }
  catalog: {
    topProducts: RankedProduct[]
    topServices: RankedService[]
    lowStockProducts: RankedProduct[]
  }
  feedback: {
    averageRating: number
    negativeReviews: ReviewAlert[]
    complaintCount: number
  }
  finance: {
    grossRevenue: number
    platformFee: number
    netPayout: number
    transactions: number
  }
  notifications: NotificationItem[]
}
