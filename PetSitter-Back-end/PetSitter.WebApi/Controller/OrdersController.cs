using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.DTO;
using PetSitter.Services.Interfaces;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PetSitter.WebApi.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IOrderRepository _orderRepository;
        private readonly IHubContext<NotificationHub> _notificationHub;

        public OrdersController(IOrderService orderService, IOrderRepository orderRepository, IHubContext<NotificationHub> notificationHub)
        {
            _orderService = orderService;
            _orderRepository = orderRepository;
            _notificationHub = notificationHub;
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutRequestDto checkoutRequest)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            try
            {
                var paymentMethod = (checkoutRequest.PaymentMethod ?? "PayOS").Trim();
                if (paymentMethod.Equals("COD", StringComparison.OrdinalIgnoreCase) ||
                    paymentMethod.Equals("CashOnDelivery", StringComparison.OrdinalIgnoreCase) ||
                    paymentMethod.Equals("ThanhToanKhiNhanHang", StringComparison.OrdinalIgnoreCase))
                {
                    var order = await _orderService.CreateCashOnDeliveryOrder(checkoutRequest, userId);
                    await BroadcastOrderNotification(checkoutRequest.FullName, order.TotalAmount);
                    return Ok(new
                    {
                        success = true,
                        paymentMethod = "COD",
                        orderId = order.OrderId,
                        orderCode = order.OrderCode,
                        message = "Đặt hàng thanh toán khi nhận hàng thành công."
                    });
                }

                var paymentLinkInfo = await _orderService.CreateOrderAndInitiatePayment(checkoutRequest, userId);
                if (paymentLinkInfo == null || string.IsNullOrEmpty(paymentLinkInfo.checkoutUrl))
                {
                    return BadRequest(new { message = "Could not create payment link." });
                }

                await BroadcastOrderNotification(checkoutRequest.FullName, 0);

                // Trả về toàn bộ object hoặc chỉ checkoutUrl tùy theo nhu cầu của frontend
                return Ok(paymentLinkInfo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred: {ex.Message}" });
            }
        }

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrderById(Guid orderId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            try
            {
                var order = await _orderRepository.FindByIdAsync(orderId);

                if (order == null)
                {
                    return NotFound(new { message = "Order not found." });
                }

                if (order.UserId != userId)
                {
                    return Forbid();
                }

                return Ok(order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred: {ex.Message}" });
            }
        }
        [HttpGet("getAllOrders")]
        public async Task<IActionResult> GetAllOrders()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }
            try
            {
                var orders = await _orderRepository.GetOrdersByUserIdAsync(userId);

                if (orders == null || !orders.Any())
                {
                    return NotFound(new { message = "Orders are empty" });
                }

                var ordersDto = orders
                    .SelectMany(o => o.OrderItems.Select(oi => new { Order = o, OrderItem = oi }))
                    .GroupBy(x => new { x.Order.OrderId, Shop = x.OrderItem.Product.Shop })
                    .Select(g => new OrderDetailDto
                    {
                        OrderId = g.Key.OrderId,
                        ShopId = g.Key.Shop.ShopId,
                        ShopName = g.Key.Shop.ShopName,
                        TotalAmount = g.Sum(x => x.OrderItem.Quantity * x.OrderItem.Price),
                        Status = g.First().Order.Status.ToString(),
                        CreatedAt = g.First().Order.CreatedAt,
                        ShippingAddress = g.First().Order.ShippingAddress,
                        Items = g.Select(x => new OrderItemDto
                        {
                            ItemId = x.OrderItem.OrderItemId,
                            ProductId = x.OrderItem.ProductId,
                            ProductImage = x.OrderItem.Product.ProductImageUrl,
                            ProductName = x.OrderItem.Product.ProductName,
                            Quantity = x.OrderItem.Quantity,
                            Price = x.OrderItem.Price,
                            SelectedVariant = x.OrderItem.SelectedVariant
                        }).ToList()
                    });

                return Ok(ordersDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred: {ex.Message}" });
            }


        }

        private async Task BroadcastOrderNotification(string fullName, decimal totalAmount)
        {
            var actorName = string.IsNullOrWhiteSpace(fullName) ? "Một khách hàng" : fullName.Trim();
            var amountText = totalAmount > 0 ? $" với tổng tiền {totalAmount:N0} đ" : string.Empty;

            await _notificationHub.Clients.All.SendAsync("ReceiveNotification", new
            {
                Type = "order-created",
                Title = "Đơn hàng mới",
                Message = $"{actorName} vừa đặt hàng thành công{amountText}.",
                ActorName = actorName,
                CreatedAt = DateTime.UtcNow.ToString("o")
            });
        }
    }
}
