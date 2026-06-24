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
            var (createdOrder, itemsForPayOS) = await CreatePendingOrder(checkoutRequest, userId);

            var paymentData = new PaymentData(
                orderCode: createdOrder.OrderCode,
                amount: (int)createdOrder.TotalAmount,
                description: $"PetSitter {createdOrder.OrderCode}",
                items: itemsForPayOS,
                cancelUrl: "http://localhost:5100/payment/cancel",
                returnUrl: "http://localhost:5100/payment/success"
            );

            return await _paymentService.CreatePaymentLink(paymentData);
        }

        public async Task<Orders> CreateCashOnDeliveryOrder(CheckoutRequestDto checkoutRequest, Guid userId)
        {
            var (createdOrder, _) = await CreatePendingOrder(checkoutRequest, userId);
            return createdOrder;
        }

        private async Task<(Orders CreatedOrder, List<ItemData> ItemsForPayOS)> CreatePendingOrder(CheckoutRequestDto checkoutRequest, Guid userId)
        {
            if (checkoutRequest.CartItems == null || checkoutRequest.CartItems.Count == 0)
            {
                throw new Exception("Cart is empty.");
            }

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
                    Price = product.Price,
                    SelectedVariant = cartItem.SelectedVariant
                });

                var payOsItemName = product.ProductName.Length > 25
                    ? product.ProductName.Substring(0, 25)
                    : product.ProductName;
                itemsForPayOS.Add(new ItemData(payOsItemName, cartItem.Quantity, (int)product.Price));

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
            return (createdOrder, itemsForPayOS);
        }
    }
}
