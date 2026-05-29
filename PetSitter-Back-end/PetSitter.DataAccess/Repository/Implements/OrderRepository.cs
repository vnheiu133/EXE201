using Microsoft.EntityFrameworkCore;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PetSitter.DataAccess.Repository.Implements
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Orders> CreateOrderAsync(Orders order)
        {
            await _context.Orders.AddAsync(order);
            await _context.SaveChangesAsync();
            return order;
        }

        public async Task<Orders> FindByIdAsync(Guid orderId)
        {
            var order = await _context.Orders
                .Select(x => new Orders
                {
                    OrderId = x.OrderId,
                    OrderCode = x.OrderCode,
                    TotalAmount = x.TotalAmount,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt,
                    ShippingAddress = x.ShippingAddress,
                    OrderItems = x.OrderItems.Select(oi => new OrderItem
                    {
                        OrderItemId = oi.OrderItemId,
                        OrderId = oi.OrderId,
                        ProductId = oi.ProductId,
                        Quantity = oi.Quantity,
                        Price = oi.Price,
                        Status = oi.Status,
                        Product = new Products
                        {
                            ProductId = oi.Product.ProductId,
                            ProductName = oi.Product.ProductName,
                            Description = oi.Product.Description,
                            StockQuantity = oi.Product.StockQuantity,
                            AvailabilityStatus = oi.Product.AvailabilityStatus,
                            ShippingInfo = oi.Product.ShippingInfo,
                            Price = oi.Product.Price,
                            ProductImageUrl = oi.Product.ProductImageUrl,
                            ShopId = oi.Product.ShopId,
                            Shop = new Shops
                            {
                                ShopId = oi.Product.Shop.ShopId,
                                ShopName = oi.Product.Shop.ShopName
                            }
                        }
                    }).ToList()
                }).FirstOrDefaultAsync(x => x.OrderId == orderId);
            return order!;
        }

        public async Task<Orders> FindByOrderCodeAsync(long orderCode)
        {
            return await _context.Orders.FirstOrDefaultAsync(o => o.OrderCode == orderCode);
        }
        public async Task UpdateOrderAsync(Orders order)
        {
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
        }
        public async Task<IEnumerable<Orders>> GetAllOrderAsync()
        {
            return await _context.Orders
                          .Include(o => o.OrderItems)
                          .ThenInclude(oi => oi.Product)
                          .ThenInclude(p => p.Shop)
                          .ToListAsync();

        }
    }
}
