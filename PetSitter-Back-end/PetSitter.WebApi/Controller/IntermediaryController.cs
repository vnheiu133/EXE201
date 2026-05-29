using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetSitter.DataAccess;
using PetSitter.Models.Enums;

namespace PetSitter.WebApi.Controller;

[ApiController]
[Route("api/[controller]")]
public class IntermediaryController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public IntermediaryController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1);
        var todayStart = now.Date;
        var sixMonthsAgo = new DateTime(now.Year, now.Month, 1).AddMonths(-5);

        var shops = await _context.Shops
            .Include(s => s.User)
            .Include(s => s.Products)
                .ThenInclude(p => p.Reviews)
            .Include(s => s.Services)
                .ThenInclude(sv => sv.ServiceReviews)
            .AsNoTracking()
            .ToListAsync();

        var customers = await _context.Users
            .Where(u => u.Role == UserRole.User)
            .Include(u => u.Orders)
            .Include(u => u.Bookings)
            .AsNoTracking()
            .ToListAsync();

        var orders = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                    .ThenInclude(p => p.Shop)
            .AsNoTracking()
            .ToListAsync();

        var bookings = await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Service)
                .ThenInclude(s => s.Shop)
            .AsNoTracking()
            .ToListAsync();

        var productReviews = await _context.Reviews
            .Include(r => r.Users)
            .Include(r => r.Product)
                .ThenInclude(p => p.Shop)
            .AsNoTracking()
            .ToListAsync();

        var serviceReviews = await _context.ServiceReviews
            .Include(r => r.Users)
            .Include(r => r.Service)
                .ThenInclude(s => s.Shop)
            .AsNoTracking()
            .ToListAsync();

        var orderItems = orders.SelectMany(o => o.OrderItems).ToList();
        var completedOrders = orders.Where(o => o.Status == OrderStatus.Completed).ToList();
        var cancelledOrders = orders.Where(o => o.Status == OrderStatus.Cancelled).ToList();
        var totalRevenue = completedOrders.Sum(o => o.TotalAmount) + bookings.Where(b => b.Status == BookingStatus.Completed).Sum(b => b.TotalPrice);
        var totalTransactions = orders.Count + bookings.Count;

        var shopRows = shops
            .Select(shop =>
            {
                var shopOrderItems = orderItems.Where(oi => oi.Product.ShopId == shop.ShopId).ToList();
                var shopOrderIds = shopOrderItems.Select(oi => oi.OrderId).Distinct().Count();
                var shopRevenue = shopOrderItems
                    .Where(oi => oi.Order.Status == OrderStatus.Completed)
                    .Sum(oi => oi.Price * oi.Quantity);
                var shopBookingRevenue = bookings
                    .Where(b => b.Service.ShopId == shop.ShopId && b.Status == BookingStatus.Completed)
                    .Sum(b => b.TotalPrice);

                var ratings = shop.Products.SelectMany(p => p.Reviews).Select(r => (double?)r.Rating)
                    .Concat(shop.Services.SelectMany(s => s.ServiceReviews).Select(r => (double?)r.Rating))
                    .Where(r => r.HasValue)
                    .Select(r => r!.Value)
                    .ToList();

                return new
                {
                    shopId = shop.ShopId,
                    shopName = shop.ShopName,
                    ownerName = shop.User?.FullName ?? "Unknown owner",
                    ownerEmail = shop.User?.Email ?? "",
                    phoneNumber = shop.User?.PhoneNumber ?? "",
                    address = shop.Address,
                    location = shop.Location,
                    shopImageUrl = shop.ShopImageUrl,
                    productCount = shop.Products.Count,
                    serviceCount = shop.Services.Count,
                    orderCount = shopOrderIds,
                    revenue = Math.Round(shopRevenue + shopBookingRevenue, 0),
                    rating = ratings.Any() ? Math.Round(ratings.Average(), 1) : 0,
                    status = shop.Products.Any() || shop.Services.Any() ? "active" : "pending",
                    createdAt = shop.CreatedAt
                };
            })
            .OrderByDescending(s => s.revenue)
            .ToList();

        var revenueByMonth = Enumerable.Range(0, 6)
            .Select(offset =>
            {
                var month = sixMonthsAgo.AddMonths(offset);
                var orderRevenue = completedOrders
                    .Where(o => o.CreatedAt.Year == month.Year && o.CreatedAt.Month == month.Month)
                    .Sum(o => o.TotalAmount);
                var bookingRevenue = bookings
                    .Where(b => b.Status == BookingStatus.Completed && b.CreatedAt.Year == month.Year && b.CreatedAt.Month == month.Month)
                    .Sum(b => b.TotalPrice);

                return new
                {
                    label = month.ToString("MM/yyyy"),
                    revenue = Math.Round(orderRevenue + bookingRevenue, 0)
                };
            })
            .ToList();

        var topProducts = orderItems
            .GroupBy(oi => oi.ProductId)
            .Select(g => new
            {
                productId = g.Key,
                productName = g.First().Product.ProductName,
                shopName = g.First().Product.Shop.ShopName,
                imageUrl = g.First().Product.ProductImageUrl,
                sold = g.Sum(x => x.Quantity),
                revenue = Math.Round(g.Sum(x => x.Price * x.Quantity), 0),
                stockQuantity = g.First().Product.StockQuantity,
                status = g.First().Product.StockQuantity > 0 ? "in_stock" : "out_of_stock"
            })
            .OrderByDescending(p => p.sold)
            .Take(6)
            .ToList();

        var topServices = bookings
            .GroupBy(b => b.ServiceId)
            .Select(g => new
            {
                serviceId = g.Key,
                serviceName = g.First().Service.ServiceName,
                shopName = g.First().Service.Shop.ShopName,
                imageUrl = g.First().Service.ServiceImageUrl,
                bookings = g.Count(),
                revenue = Math.Round(g.Where(x => x.Status == BookingStatus.Completed).Sum(x => x.TotalPrice), 0),
                status = g.Any(x => x.Status == BookingStatus.Pending) ? "busy" : "available"
            })
            .OrderByDescending(s => s.bookings)
            .Take(6)
            .ToList();

        var lowStockProducts = shops
            .SelectMany(s => s.Products)
            .Where(p => p.StockQuantity <= 5)
            .OrderBy(p => p.StockQuantity)
            .Take(6)
            .Select(p => new
            {
                productId = p.ProductId,
                productName = p.ProductName,
                shopName = p.Shop.ShopName,
                stockQuantity = p.StockQuantity,
                imageUrl = p.ProductImageUrl
            })
            .ToList();

        var customerRows = customers
            .Select(customer =>
            {
                var completedCustomerOrders = customer.Orders.Where(o => o.Status == OrderStatus.Completed).ToList();
                var totalSpent = completedCustomerOrders.Sum(o => o.TotalAmount) +
                                 bookings.Where(b => b.CustomerId == customer.UserId && b.Status == BookingStatus.Completed).Sum(b => b.TotalPrice);

                return new
                {
                    userId = customer.UserId,
                    fullName = customer.FullName,
                    email = customer.Email,
                    phoneNumber = customer.PhoneNumber,
                    address = customer.Address,
                    profilePictureUrl = customer.ProfilePictureUrl,
                    orderCount = customer.Orders.Count,
                    bookingCount = customer.Bookings.Count,
                    totalSpent = Math.Round(totalSpent, 0),
                    createdAt = customer.CreatedAt,
                    lastOrderAt = customer.Orders.OrderByDescending(o => o.CreatedAt).Select(o => (DateTime?)o.CreatedAt).FirstOrDefault()
                };
            })
            .OrderByDescending(c => c.totalSpent)
            .ToList();

        var repeatCustomers = customerRows.Count(c => c.orderCount + c.bookingCount >= 2);
        var averageRatingAll = productReviews.Select(r => (double)r.Rating)
            .Concat(serviceReviews.Select(r => (double)r.Rating))
            .DefaultIfEmpty(0)
            .Average();

        var negativeReviews = productReviews
            .Where(r => r.Rating <= 3)
            .Select(r => new
            {
                reviewId = r.ReviewId,
                type = "product",
                rating = r.Rating,
                comment = r.Comment,
                customerName = r.Users.FullName,
                shopName = r.Product.Shop.ShopName,
                targetName = r.Product.ProductName,
                createdAt = r.CreatedAt
            })
            .Concat(serviceReviews
                .Where(r => r.Rating <= 3)
                .Select(r => new
                {
                    reviewId = r.ReviewId,
                    type = "service",
                    rating = r.Rating,
                    comment = r.Comment,
                    customerName = r.Users.FullName,
                    shopName = r.Service.Shop.ShopName,
                    targetName = r.Service.ServiceName,
                    createdAt = r.CreatedAt
                }))
            .OrderByDescending(r => r.createdAt)
            .Take(8)
            .ToList();

        var recentOrders = orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(8)
            .Select(o => new
            {
                orderId = o.OrderId,
                customerName = o.User?.FullName ?? "Khach hang",
                totalAmount = o.TotalAmount,
                status = o.Status.ToString().ToLowerInvariant(),
                itemCount = o.OrderItems.Count,
                createdAt = o.CreatedAt,
                shopNames = o.OrderItems.Select(oi => oi.Product.Shop.ShopName).Distinct().ToList()
            })
            .ToList();

        var notifications = new List<object>();

        notifications.AddRange(shops
            .OrderByDescending(s => s.CreatedAt)
            .Take(3)
            .Select(s => new
            {
                title = "Shop moi dang ky",
                description = $"{s.ShopName} vua tham gia he thong",
                createdAt = s.CreatedAt,
                tone = "info"
            }));

        notifications.AddRange(orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(3)
            .Select(o => new
            {
                title = "Don hang moi",
                description = $"Don {o.OrderCode} tu {o.User.FullName}",
                createdAt = o.CreatedAt,
                tone = o.Status == OrderStatus.Cancelled ? "critical" : "success"
            }));

        notifications.AddRange(lowStockProducts.Take(3)
            .Select(p => new
            {
                title = "San pham can xu ly",
                description = $"{p.productName} chi con {p.stockQuantity} san pham",
                createdAt = now,
                tone = "warning"
            }));

        var response = new
        {
            overview = new
            {
                activeShops = shopRows.Count(s => s.status == "active"),
                pendingShops = shopRows.Count(s => s.status == "pending"),
                lockedShops = 0,
                customers = customerRows.Count,
                totalOrders = orders.Count,
                ordersToday = orders.Count(o => o.CreatedAt >= todayStart),
                ordersThisMonth = orders.Count(o => o.CreatedAt >= monthStart),
                totalRevenue = Math.Round(totalRevenue, 0),
                completedRate = orders.Count == 0 ? 0 : Math.Round((decimal)completedOrders.Count / orders.Count * 100, 1),
                cancelledRate = orders.Count == 0 ? 0 : Math.Round((decimal)cancelledOrders.Count / orders.Count * 100, 1),
                returnRate = 0,
                totalProducts = shops.Sum(s => s.Products.Count),
                totalServices = shops.Sum(s => s.Services.Count),
                totalBookings = bookings.Count,
                repeatCustomersRate = customerRows.Count == 0 ? 0 : Math.Round((decimal)repeatCustomers / customerRows.Count * 100, 1),
                averageRating = Math.Round(averageRatingAll, 1),
                openIssues = negativeReviews.Count
            },
            charts = new
            {
                revenueByMonth,
                topShops = shopRows.Take(6),
                orderStatus = new[]
                {
                    new { label = "Hoan thanh", value = completedOrders.Count },
                    new { label = "Cho xu ly", value = orders.Count(o => o.Status == OrderStatus.Pending) },
                    new { label = "Da huy", value = cancelledOrders.Count }
                }
            },
            shops = shopRows,
            customers = customerRows.Take(10),
            orders = new
            {
                recent = recentOrders,
                pending = orders.Count(o => o.Status == OrderStatus.Pending),
                completed = completedOrders.Count,
                cancelled = cancelledOrders.Count
            },
            catalog = new
            {
                topProducts,
                topServices,
                lowStockProducts
            },
            feedback = new
            {
                averageRating = Math.Round(averageRatingAll, 1),
                negativeReviews,
                complaintCount = negativeReviews.Count
            },
            finance = new
            {
                grossRevenue = Math.Round(totalRevenue, 0),
                platformFee = Math.Round(totalRevenue * 0.1m, 0),
                netPayout = Math.Round(totalRevenue * 0.9m, 0),
                transactions = totalTransactions
            },
            notifications = notifications
                .OrderByDescending(n => ((dynamic)n).createdAt)
                .Take(8)
                .ToList()
        };

        return Ok(response);
    }
}
