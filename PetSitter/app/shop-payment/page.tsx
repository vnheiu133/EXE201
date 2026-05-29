"use client";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { getAllOrders } from "@/components/api/shop-payment";
import { ShopOrder } from "@/types/shop-payment";

type OrderStatus = "completed" | "pending" | "cancelled";

export default function StoresPage() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const pageSize = 3; // số order mỗi trang

  // Sort orders (chỉ demo, bạn có thể sửa theo CreatedAt)
  const sortedOrders = [...orders].sort((a, b) =>
    sortOrder === "asc" ? 1 : -1
  );

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const pagedOrders = sortedOrders.slice(startIdx, startIdx + pageSize);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Actions
  const handleDetailClick = (order: ShopOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleTransferClick = (order: ShopOrder) => {
    setSelectedOrder(order);
    setShowTransferModal(true);
  };

  const handleConfirmTransfer = () => {
    alert("Chuyển tiền thành công!");
    setShowTransferModal(false);
    setSelectedOrder(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      const orders = await getAllOrders();
      setOrders(orders);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Danh sách thanh toán cửa hàng
        </h1>

        {/* Filter + Sort */}
        <div className="flex items-center gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="pending">Đang chờ</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="desc">Mới nhất</option>
            <option value="asc">Cũ nhất</option>
          </select>
        </div>

        {/* Orders list */}
        <div className="bg-white shadow-md rounded-2xl overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600">
                <th className="p-3">Cửa hàng</th>
                <th className="p-3">Số tiền</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pagedOrders.map((order, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-3">{order.shopName}</td>
                  <td className="p-3">{new Intl.NumberFormat("vi-VN").format(order.totalAmount)} đ</td>
                  <td className="p-3 text-right flex gap-2 justify-end">
                    <button
                      onClick={() => handleDetailClick(order)}
                      className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleTransferClick(order)}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Chuyển khoản
                    </button>
                  </td>
                </tr>
              ))}
              {pagedOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 p-6">
                    Không tìm thấy đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
            >
              ← Trước
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  currentPage === i + 1
                    ? "bg-indigo-600 text-white"
                    : "border text-gray-700 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      {/* Modal Chi tiết */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-300/50 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Chi tiết đơn hàng
            </h2>

            <p className="text-sm text-gray-600 mb-2">
              Cửa hàng:{" "}
              <span className="font-medium">{selectedOrder.shopName}</span>
            </p>

            {/* Danh sách sản phẩm */}
            <table className="w-full text-sm border-collapse mb-4">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600">
                  <th className="p-2">Hình ảnh</th>
                  <th className="p-2">Sản phẩm</th>
                  <th className="p-2 text-center">Số lượng</th>
                  <th className="p-2 text-right">Đơn giá</th>
                  <th className="p-2 text-right">Tổng cộng</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item) => (
                  <tr key={item.itemId} className="border-t">
                    <td className="p-2">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="p-2">{item.productName}</td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right">
                      {new Intl.NumberFormat("vi-VN").format(item.price)} đ
                    </td>
                    <td className="p-2 text-right">
                      {new Intl.NumberFormat("vi-VN").format(item.price * item.quantity)} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-sm text-gray-600 mb-4 text-right">
              <span className="font-medium">Tổng thanh toán: </span>
              <span className="font-bold text-indigo-600">
                {new Intl.NumberFormat("vi-VN").format(selectedOrder.totalAmount)} đ
              </span>
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chuyển tiền */}
      {showTransferModal && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-300/50 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[400px]">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Xác nhận chuyển khoản
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              Cửa hàng:{" "}
              <span className="font-medium">{selectedOrder.shopName}</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Số tiền chuyển:{" "}
              <span className="font-medium text-indigo-600">
                {new Intl.NumberFormat("vi-VN").format(selectedOrder.totalAmount * 0.9)} đ
              </span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmTransfer}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
