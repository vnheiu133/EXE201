using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        public OrdersController(IOrderService orderService, IOrderRepository orderRepository)
        {
            _orderService = orderService;
            _orderRepository = orderRepository;
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
                var paymentLinkInfo = await _orderService.CreateOrderAndInitiatePayment(checkoutRequest, userId);
                if (paymentLinkInfo == null || string.IsNullOrEmpty(paymentLinkInfo.checkoutUrl))
                {
                    return BadRequest(new { message = "Could not create payment link." });
                }

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
            //var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            //if (!Guid.TryParse(userIdString, out var userId))
            //{
            //    return Unauthorized(new { message = "Invalid user token." });
            //}
            try
            {
                var orders = await _orderRepository.GetAllOrderAsync();

                if (orders == null || !orders.Any())
                {
                    return NotFound(new { message = "Orders are empty" });
                }

                var orderItems = orders
                    .SelectMany(o => o.OrderItems)
                    .Where(oi => oi.Status == 1);

                var ordersDto = orderItems
                    .GroupBy(oi => oi.Product.Shop)
                    .Select(g => new OrderDetailDto
                    {
                        ShopId = g.Key.ShopId,
                        ShopName = g.Key.ShopName,
                        TotalAmount = g.Sum(i => i.Quantity * i.Price),
                        Items = g.Select(i => new OrderItemDto
                        {
                            ItemId = i.OrderItemId,
                            ProductId = i.ProductId,
                            ProductImage = i.Product.ProductImageUrl,
                            ProductName = i.Product.ProductName,
                            Quantity = i.Quantity,
                            Price = i.Price,
                        }).ToList()
                    });

                return Ok(ordersDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred: {ex.Message}" });
            }


        }
    }
}