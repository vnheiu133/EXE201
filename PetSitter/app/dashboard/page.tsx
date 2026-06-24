"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  DollarSign,
  ShoppingBag,
  ArrowLeft,
  Search,
  Download,
  Filter,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { Product } from "@/types/product";
import { UserRole } from "@/enum/UserRole";
import {
    getShopByUserId,
    getProductsByShopId,
    getProductCountByShopId,
    getOrderCountByShopId,
    getProductTags,
    getProductBrands,
    getProductCategories, getShopRevenue, getTotalSoldProducts,
} from "@/components/api/shop";
import { getServicesByShopId } from "@/components/api/feature";
import type { Service } from "@/types/feature";

const IntermediaryDashboard = dynamic(() => import("@/components/intermediary-dashboard"), {
  ssr: false,
  loading: () => <div className="flex h-screen items-center justify-center text-gray-600">Dang tai dashboard...</div>,
});

const ProductForm = dynamic(() => import("@/components/ProductForm"), {
  ssr: false,
  loading: () => <div className="py-8 text-center text-sm text-gray-500">Dang tai form...</div>,
});

const ResponsiveContainer: any = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer as any), { ssr: false });
const BarChart: any = dynamic(() => import("recharts").then((mod) => mod.BarChart as any), { ssr: false });
const XAxis: any = dynamic(() => import("recharts").then((mod) => mod.XAxis as any), { ssr: false });
const YAxis: any = dynamic(() => import("recharts").then((mod) => mod.YAxis as any), { ssr: false });
const Tooltip: any = dynamic(() => import("recharts").then((mod) => mod.Tooltip as any), { ssr: false });
const Bar: any = dynamic(() => import("recharts").then((mod) => mod.Bar as any), { ssr: false });

// Types
type TagObj = { productTagId: string; productTagName: string };
type BrandObj = { brandId: string; brandName: string };
type CategoryObj = { categoryId: string; categoryName: string };

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [shopId, setShopId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ totalProducts: 0, totalRevenue: 0, totalSold: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [tags, setTags] = useState<TagObj[]>([]);
  const [brands, setBrands] = useState<BrandObj[]>([]);
  const [categories, setCategories] = useState<CategoryObj[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("latest");
  const [showGuidelines, setShowGuidelines] = useState(false);

  // --- THAY ĐỔI: Thêm state cho filter ---
  const [filterState, setFilterState] = useState({
    quickFilter: "all", // 'all', 'available', 'low_stock', 'price_gt_500k'
    brand: null as string | null, // Tên thương hiệu đang được lọc
  });
  // ----------------------------------------

  // ... (useEffect cho 'guard' và 'fetch all data' giữ nguyên)
  // guard
  useEffect(() => {
    if (!user) return;
    if (user.role !== UserRole.Shop && user.role !== UserRole.Intermediary) {
      if (typeof window !== "undefined") router.push("/");
    }
  }, [user, router]);

  // fetch all data
  useEffect(() => {
    if (!user) return;
    if (user.role === UserRole.Intermediary) {
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const shopRes = await getShopByUserId(user.userId);
        if (!shopRes.success || !shopRes.data) {
          throw new Error("Không tải được thông tin cửa hàng");
        }
        const sid = shopRes.data.shopId;
        if (!mounted) return;
        setShopId(sid);

        const productsPromise = getProductsByShopId(sid);
        const dashboardDataPromise = Promise.allSettled([
          getProductCountByShopId(sid),
          getOrderCountByShopId(sid),
          getProductTags(),
          getProductBrands(),
          getProductCategories(),
          getShopRevenue(sid),
          getTotalSoldProducts(sid),
          getServicesByShopId(sid),
        ]);

        const prodRes = await productsPromise;

        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data);
          setStats((current) => ({ ...current, totalProducts: prodRes.data?.length || 0 }));
          // Không setFilteredProducts ở đây, để useEffect filter chính xử lý
        }
        if (mounted) setLoading(false);

        const [countResult, _orderResult, tagsResult, brandsResult, categoriesResult, revenueResult, soldResult, servicesResult] =
          await dashboardDataPromise;

        if (!mounted) return;

        const countRes = countResult.status === "fulfilled" ? countResult.value : null;
        const tagsRes = tagsResult.status === "fulfilled" ? tagsResult.value : null;
        const brandsRes = brandsResult.status === "fulfilled" ? brandsResult.value : null;
        const categoriesRes = categoriesResult.status === "fulfilled" ? categoriesResult.value : null;
        const revenueRes = revenueResult.status === "fulfilled" ? revenueResult.value : null;
        const soldRes = soldResult.status === "fulfilled" ? soldResult.value : null;
        const shopServices = servicesResult.status === "fulfilled" ? servicesResult.value : [];

        setServices(shopServices);

          const newStats = {
              totalProducts: countRes?.success ? countRes.data || 0 : prodRes.data?.length || 0,
              totalSold: soldRes?.success ? soldRes.data || 0 : 0,
              totalRevenue: revenueRes?.success ? revenueRes.data || 0 : 0,
          };
          setStats(newStats);

        if (tagsRes?.success) setTags(tagsRes.data || []);
        if (brandsRes?.success) setBrands(brandsRes.data || []);
        if (categoriesRes?.success) setCategories(categoriesRes.data || []);

      } catch (err: any) {
        console.error(err);
        if (mounted) setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [user]);

  // --- THAY ĐỔI: Gộp tất cả logic filter vào một useEffect ---
  useEffect(() => {
    const q = search.trim().toLowerCase();
    let list = products.slice(); // Luôn bắt đầu từ danh sách gốc

    // 1. Filter theo Search
    if (q) {
      list = list.filter((p) =>
        p.productName.toLowerCase().includes(q) ||
        (p.tags || []).some(t => (typeof t === 'string' ? t : (t as TagObj).productTagName).toLowerCase().includes(q))
      );
    }

    // 2. Filter theo Quick Filter
    switch (filterState.quickFilter) {
      case "available":
        list = list.filter(p => p.availabilityStatus);
        break;
      case "low_stock":
        list = list.filter(p => (p.stockQuantity ?? 0) <= 5);
        break;
      case "price_gt_500k":
        list = list.filter(p => (p.price ?? 0) > 500000);
        break;
      case "all":
      default:
        // Không làm gì, giữ nguyên danh sách (đã lọc bởi search)
        break;
    }

    // 3. Filter theo Brand
    if (filterState.brand) {
      list = list.filter(p => p.brandName === filterState.brand);
    }

    // 4. Sắp xếp (Sort)
    switch (sortBy) {
      case "price_asc":
        list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price_desc":
        list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "name":
        list.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case "rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      default:
        // 'latest': Giữ nguyên thứ tự
        break;
    }

    setFilteredProducts(list);
  }, [products, search, sortBy, filterState]); // Thêm filterState vào dependency
  // ----------------------------------------------------

  // ... (useCallback, useMemo giữ nguyên)
  const formatCurrency = useCallback((n?: number) => (n ?? 0).toLocaleString("vi-VN") + " ₫", []);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const key = p.categoryName || "Chưa phân loại";
      const stock = p.stockQuantity ?? 1;
      const value = (p.price ?? 0) * stock;
      map.set(key, (map.get(key) || 0) + value);
    });
    return Array.from(map.entries()).map(([k, v]) => ({ category: k, value: Math.round(v / 1000) }));
  }, [products]);

  const handleDelete = useCallback(async (id: string) => {
    console.log("Deleting product:", id);
    setProducts((prev) => prev.filter((p) => p.productId !== id));
  }, []);

  const downloadCSV = useCallback(() => {
    const header = ["Mã sản phẩm", "Tên", "Giá", "Danh mục", "Thương hiệu", "Thẻ", "Ảnh", "Tồn kho", "Đánh giá", "Trạng thái"];
    const rows = products.map((p) => [
      p.productId,
      p.productName,
      p.price ?? 0,
      p.categoryName ?? "",
      p.brandName ?? "",
      (p.tags || []).map(t => typeof t === 'string' ? t : (t as TagObj).productTagName).join("|") || "",
      p.productImageUrl ?? "",
      p.stockQuantity ?? 0,
      p.rating ?? 0,
      p.availabilityStatus ? "còn_hàng" : "hết_hàng",
    ]);

    const csvContent = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n"); 

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products_${shopId || "shop"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [products, shopId]);

  const handleFormSuccess = useCallback((newProduct: Product) => {
    setProducts((prev) =>
      editing
        ? prev.map((x) => (x.productId === newProduct.productId ? newProduct : x))
        : [newProduct, ...prev]
    );
    setIsDialogOpen(false);
    setEditing(null);
  }, [editing]);

  const handleOpenDialog = (product: Product | null = null) => {
    setEditing(product);
    setIsDialogOpen(true);
  };
  
  // --- THAY ĐỔI: Thêm handlers cho filter ---
  const handleQuickFilterChange = (filter: string) => {
    setFilterState({
      quickFilter: filter, // Đặt quick filter mới
      brand: null, // Reset brand filter khi chọn quick filter
    });
  };

  const handleBrandFilterChange = (brandName: string) => {
    setFilterState(prevState => ({
      quickFilter: "all", // Reset quick filter khi chọn brand
      // Nếu nhấn vào brand đang active thì tắt (null), ngược lại thì set brand mới
      brand: prevState.brand === brandName ? null : brandName,
    }));
  };
  // ----------------------------------------

  if (user?.role === UserRole.Intermediary) {
    return <IntermediaryDashboard />;
  }
  if (loading) return <div className="flex h-screen items-center justify-center text-gray-600">Đang tải...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto py-8">
      <DashboardHeader
        onBack={() => router.push("/shop")}
        onShowGuidelines={() => setShowGuidelines(true)}
        onExportCSV={downloadCSV}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Tổng sản phẩm"
          value={stats.totalProducts || products.length} 
          icon={<Package className="h-5 w-5 text-gray-500" />} 
        />
        <StatCard 
          title="Doanh thu"
          value={formatCurrency(stats.totalRevenue)} 
          icon={<DollarSign className="h-5 w-5 text-gray-500" />} 
        />
        <StatCard 
          title="Đã bán"
          value={stats.totalSold}
          icon={<ShoppingBag className="h-5 w-5 text-gray-500" />} 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Dịch vụ của shop</CardTitle>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <p className="text-sm text-gray-500">Shop của bạn hiện chưa có dịch vụ nào.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {services.map((service) => {
                    const serviceImage =
                      Array.isArray(service.serviceImageUrl)
                        ? (service.serviceImageUrl[0] || "/placeholder.svg")
                        : (service.serviceImageUrl || "/placeholder.svg");

                    return (
                      <div key={service.serviceId} className="flex gap-3 rounded-lg border bg-white p-3">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                          <Image
                            src={serviceImage}
                            alt={service.serviceName}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-semibold">{service.serviceName}</h3>
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500">{service.description}</p>
                          <p className="mt-2 text-sm font-semibold text-orange-600">
                            {formatCurrency(service.pricePerPerson)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Toolbar và Nút Add Product */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <ProductToolbar
              search={search}
              onSearchChange={(e) => setSearch(e.target.value)}
              onSortChange={(v) => setSortBy(v)}
            />

            <div className="flex items-center gap-2 flex-shrink-0">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4" /> Thêm sản phẩm
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
                  </DialogHeader>
                  <ProductForm
                    editing={editing}
                    setEditing={setEditing} 
                    shopId={shopId}
                    tags={tags}
                    brands={brands}
                    categories={categories}
                    onSuccess={handleFormSuccess}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Product List */}
          {filteredProducts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Không tìm thấy sản phẩm phù hợp.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((p) => (
                <ProductItemCard
                  key={p.productId}
                  product={p}
                  formatCurrency={formatCurrency}
                  onEdit={() => handleOpenDialog(p)}
                  onDelete={() => handleDelete(p.productId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* --- THAY ĐỔI: Truyền props mới cho Sidebar --- */}
        <DashboardSidebar
          chartData={chartData}
          brands={brands}
          // Props mới để quản lý state highlight
          activeQuickFilter={filterState.quickFilter}
          activeBrand={filterState.brand}
          // Props mới là các hàm xử lý
          onQuickFilterChange={handleQuickFilterChange}
          onBrandFilterChange={handleBrandFilterChange}
        />
        {/* ------------------------------------------ */}
      </div>

      {/* Field Guide Dialog */}
      <FieldGuideDialog
        open={showGuidelines}
        onOpenChange={setShowGuidelines}
      />
    </div>
  );
}

// --- CÁC COMPONENT CON ---

// 1. Dashboard Header
const DashboardHeader = React.memo(({ onBack, onShowGuidelines, onExportCSV }: {
  onBack: () => void;
  onShowGuidelines: () => void;
  onExportCSV: () => void;
}) => (
  <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
    <div>
      <h1 className="text-3xl font-bold">Bảng điều khiển cửa hàng</h1>
      <p className="text-gray-500">Tổng quan và quản lý sản phẩm</p>
    </div>
    <div className="flex items-center gap-3">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
      </Button>
      <Button onClick={onShowGuidelines} variant="outline">
        <Filter className="mr-2 h-4 w-4" /> Hướng dẫn nhập liệu
      </Button>
      <Button onClick={onExportCSV} variant="ghost">
        <Download className="mr-2 h-4 w-4" /> Xuất CSV
      </Button>
    </div>
  </div>
));
DashboardHeader.displayName = "DashboardHeader";


// 2. Stat Card (Component tái sử dụng)
const StatCard = React.memo(({ title, value, icon }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <Card>
    <CardContent className="pt-6"> 
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
    </CardContent>
  </Card>
));
StatCard.displayName = "StatCard";


// 3. Product Toolbar
const ProductToolbar = React.memo(({ search, onSearchChange, onSortChange }: {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSortChange: (value: string) => void;
}) => (
  <div className="flex items-center gap-2 w-full max-w-md">
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input placeholder="Tìm sản phẩm hoặc thẻ..." value={search} onChange={onSearchChange} className="pl-10" />
    </div>
    <Select onValueChange={onSortChange} defaultValue="latest">
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Sắp xếp" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="latest">Mới nhất</SelectItem>
        <SelectItem value="name">Theo tên</SelectItem>
        <SelectItem value="price_asc">Giá tăng dần</SelectItem>
        <SelectItem value="price_desc">Giá giảm dần</SelectItem>
        <SelectItem value="rating">Đánh giá cao</SelectItem>
      </SelectContent>
    </Select>
  </div>
));
ProductToolbar.displayName = "ProductToolbar";


// 4. Product Item Card
const ProductItemCard = React.memo(({ product: p, formatCurrency, onEdit, onDelete }: {
  product: Product;
  formatCurrency: (n?: number) => string;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <Card className="group hover:shadow-lg transition-shadow relative overflow-hidden flex flex-col">
    <div className="relative h-44 bg-gray-100">
      <Image 
        src={p.productImageUrl || "/placeholder.png"} 
        alt={p.productName} 
        fill 
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover" 
      />
    </div>
    <CardContent className="p-4 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-2">
        <div className="w-2/3 pr-2">
          <h3 className="font-semibold line-clamp-2 text-sm" title={p.productName}>{p.productName}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description || "Chưa có mô tả"}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-orange-600 font-bold text-sm mt-1">{formatCurrency(p.price)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-2">
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-xs font-medium">{(p.rating ?? 0).toFixed(1)}</span>
          <span className="text-xs text-gray-400">({p.reviews?.length ?? 0})</span>
        </div>
        {p.availabilityStatus ? (
          <Badge variant="default" className="text-xs px-2 py-0.5">Còn hàng</Badge>
        ) : (
          <Badge variant="destructive" className="text-xs px-2 py-0.5">Hết hàng</Badge>
        )}
        <div className="text-xs text-gray-500 ml-auto">Tồn kho: {p.stockQuantity ?? "-"}</div>
      </div>

      <div className="flex flex-wrap gap-1 mt-3 border-t pt-3">
        <Badge variant="outline" className="text-xs">{p.categoryName || "N/A"}</Badge>
        <Badge variant="outline" className="text-xs">{p.brandName || "N/A"}</Badge>
        {(p.tags || []).slice(0, 2).map((t, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {typeof t === 'string' ? t : (t as TagObj).productTagName}
          </Badge>
        ))}
      </div>
      
      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
));
ProductItemCard.displayName = "ProductItemCard";


// --- THAY ĐỔI: Cập nhật DashboardSidebar ---
const DashboardSidebar = React.memo(({ 
  chartData, 
  brands, 
  activeQuickFilter, 
  activeBrand, 
  onQuickFilterChange, 
  onBrandFilterChange 
}: {
  chartData: { category: string; value: number }[];
  brands: BrandObj[];
  activeQuickFilter: string;
  activeBrand: string | null;
  onQuickFilterChange: (filter: string) => void;
  onBrandFilterChange: (brand: string) => void;
}) => (
  <div className="space-y-4 lg:sticky lg:top-8">
    {/* Card Chart (giữ nguyên) */}
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Giá trị tồn kho theo danh mục (nghìn đồng)</CardTitle>
      </CardHeader>
      <CardContent style={{ height: 220 }}>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">Chưa đủ dữ liệu</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="category" hide />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip 
                formatter={(value: unknown) => [`${Number(value).toLocaleString()} nghìn đồng`, "Giá trị"]}
                cursor={{ fill: 'transparent' }} 
              />
              <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
    
   {/* Card Quick Filters (cập nhật) */}
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bộ lọc nhanh</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Button 
            variant="ghost" // Giữ variant="ghost" làm nền
            className={`
              justify-start w-full
              ${activeQuickFilter === 'available' 
                ? 'bg-orange-400 text-white hover:bg-orange-500' // Lớp CSS khi Active
                : 'hover:bg-orange-100' // Lớp CSS khi Inactive
              }
            `} 
            onClick={() => onQuickFilterChange('available')}>
            Sản phẩm còn hàng
          </Button>
          <Button 
            variant="ghost"
            className={`
              justify-start w-full
              ${activeQuickFilter === 'low_stock' 
                ? 'bg-orange-400 text-white hover:bg-orange-500' // Active
                : 'hover:bg-orange-100' // Inactive
              }
            `} 
            onClick={() => onQuickFilterChange('low_stock')}>
            Sắp hết hàng (≤5)
          </Button>
          <Button 
            variant="ghost"
            className={`
              justify-start w-full
              ${activeQuickFilter === 'price_gt_500k' 
                ? 'bg-orange-400 text-white hover:bg-orange-500' // Active
                : 'hover:bg-orange-100' // Inactive
              }
            `} 
            onClick={() => onQuickFilterChange('price_gt_500k')}>
            Giá &gt; 500k
          </Button>
          <Button 
            variant="ghost"
            className={`
              justify-start w-full font-semibold
              ${activeQuickFilter === 'all' 
                ? 'bg-orange-400 text-white hover:bg-orange-500' // Active
                : 'hover:bg-orange-100' // Inactive
              }
            `} 
            onClick={() => onQuickFilterChange('all')}>
            Hiển thị tất cả sản phẩm
          </Button>
        </div>
      </CardContent>
    </Card>
    
    {/* Card Brands (cập nhật) */}
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lọc theo thương hiệu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {brands.length > 0 ? brands.map((b) => (
            <Badge 
              key={b.brandId} 
              // Nếu brand đang active thì là 'default' (màu đậm), ngược lại là 'secondary'
              variant={activeBrand === b.brandName ? 'default' : 'secondary'}
              onClick={() => onBrandFilterChange(b.brandName)}
              className="cursor-pointer"
            >
              {b.brandName}
            </Badge>
          )) : (
            <p className="text-sm text-gray-500">Chưa có thương hiệu.</p>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
));
DashboardSidebar.displayName = "DashboardSidebar";
// ----------------------------------------


// 6. Field Guide Dialog
const FieldGuideDialog = React.memo(({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Hướng dẫn nhập thông tin sản phẩm</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 py-2 text-sm">
        <p className="text-gray-600">Gợi ý giúp người bán nhập thông tin sản phẩm chính xác hơn.</p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
          <li><strong>Tên</strong>: Ngắn gọn, dễ hiểu, có thể kèm thương hiệu hoặc mẫu sản phẩm.</li>
          <li><strong>Giá</strong>: Nhập số tiền bằng VND, ví dụ 129000.</li>
          <li><strong>Danh mục / thương hiệu</strong>: Chọn mục gần đúng nhất để khách dễ lọc và tìm kiếm.</li>
          <li><strong>Hình ảnh</strong>: Dùng ảnh rõ, đủ sáng, khuyến nghị từ 800x800px.</li>
          <li><strong>Mô tả</strong>: Tóm tắt ngắn gọn các thông tin quan trọng của sản phẩm.</li>
          <li><strong>Thẻ</strong>: Từ khóa giúp tìm kiếm, ví dụ màu sắc, chất liệu hoặc kích cỡ.</li>
          <li><strong>Tồn kho</strong>: Tổng số lượng còn bán. Nhập 0 nếu hết hàng.</li>
          <li><strong>Trạng thái</strong>: Dùng để hiển thị hoặc ẩn sản phẩm với khách mua.</li>
        </ul>
        <div className="text-right pt-2">
          <Button onClick={() => onOpenChange(false)}>Đóng</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
));
FieldGuideDialog.displayName = "FieldGuideDialog";
