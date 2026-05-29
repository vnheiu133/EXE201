using Net.payOS.Types;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models;
using PetSitter.Models.DTO;
using PetSitter.Models.Models;
using PetSitter.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PetSitter.Services.Implements
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IProductRepository _productRepository;
        private readonly IPaymentService _paymentService;
        private static readonly Random _random = new Random();

        public OrderService(IOrderRepository orderRepository, IProductRepository productRepository, IPaymentService paymentService)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _paymentService = paymentService;
        }

        public async Task<CreatePaymentResult> CreateOrderAndInitiatePayment(CheckoutRequestDto checkoutRequest, Guid userId)
        {
            var productIds = checkoutRequest.CartItems.Select(c => c.ProductId).ToList();
            var productsFromDb = await _productRepository.GetByIdsAsync(productIds);

            var orderItems = new List<OrderItem>();
            var itemsForPayOS = new List<ItemData>();
            decimal totalAmount = 0;

            foreach (var cartItem in checkoutRequest.CartItems)
            {
                var product = productsFromDb.FirstOrDefault(p => p.ProductId == cartItem.ProductId);
                if (product == null || !product.AvailabilityStatus)
                {
                    throw new Exception($"Product with ID {cartItem.ProductId} is not available.");
                }

                orderItems.Add(new OrderItem
                {
                    ProductId = product.ProductId,
                    Quantity = cartItem.Quantity,
                    Price = product.Price
                });

                // Tạo ItemData cho PayOS
                itemsForPayOS.Add(new ItemData(product.ProductName, cartItem.Quantity, (int)product.Price));

                totalAmount += product.Price * cartItem.Quantity;
            }

            var orderCodeForPayOS = long.Parse(DateTime.UtcNow.ToString("yyMMddHHmmss") + _random.Next(10, 99));

            var newOrder = new Orders
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                TotalAmount = totalAmount,
                ShippingAddress = checkoutRequest.ShippingAddress,
                Status = Models.Enums.OrderStatus.Pending,
                OrderItems = orderItems,
                OrderCode = orderCodeForPayOS
            };

            var createdOrder = await _orderRepository.CreateOrderAsync(newOrder);

            // Tạo đối tượng PaymentData theo đúng tài liệu
            var paymentData = new PaymentData(
                orderCode: createdOrder.OrderCode,
                amount: (int)createdOrder.TotalAmount,
                description: $"Orders #{createdOrder.OrderCode}_PetSitter",

                items: itemsForPayOS,
                cancelUrl: "http://localhost:3000/payment/cancel", // Thay bằng URL của bạn
                returnUrl: "http://localhost:3000/payment/success" // Thay bằng URL của bạn
            );

            // Trả về kết quả từ việc tạo link thanh toán
            return await _paymentService.CreatePaymentLink(paymentData);
        }
    }
}