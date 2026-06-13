using Microsoft.EntityFrameworkCore;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.Models;
using PetSitter.Models.Request;
using PetSitter.Utility.Utils;

namespace PetSitter.DataAccess.Repository.Implements;

public class ShopRepository : IShopRepository
{
    private readonly ApplicationDbContext _context;
    private readonly CloudinaryUploader _cloudinary;
    
    public ShopRepository(ApplicationDbContext context,  CloudinaryUploader cloudinary)
    {
        _context = context;
        _cloudinary = cloudinary;
    }

    public async Task<Shops?> ListProductFromShopId(Guid shopId)
    {
        return await _context.Shops
            .Include(s => s.Products)
            .ThenInclude(x => x.Category)
            .Include(x => x.Products)
            .ThenInclude(x => x.Brand)
            .Include(x => x.Products)
            .ThenInclude(x => x.Tags)
            .FirstOrDefaultAsync(s => s.ShopId == shopId);
    }

    public async Task<int> CountProductFromShopId(Guid shopId)
    {
        return await _context.Products.CountAsync(p => p.ShopId == shopId);
    }

    
    public async Task<int> CountOrderFromShopId(Guid shopId)
    {
        return await _context.OrderItems
            .CountAsync(oi => oi.Product.ShopId == shopId);
    }

    public async Task<Products> AddProductFromShopId(ProductRequest request, Guid shopId)
    {
        var shop = await _context.Shops.FirstOrDefaultAsync(s => s.ShopId == shopId);
        if (shop == null)
        {
            throw new Exception("Shop not found");
        }

        string? imageUrl = null;
        if (request.ImageUrl != null)
        {
            imageUrl = await _cloudinary.UploadImage(request.ImageUrl);
        }

        var product = new Products
        {
            ProductId = Guid.NewGuid(),
            ShopId = shopId,
            ProductName = request.ProductName,
            Description = request.Description,
            BrandId = request.BrandId,
            TagId = request.TagId,
            Price = request.Price,
            StockQuantity = request.StockQuantity,
            CategoryId = request.CategoryId,
            ProductImageUrl = imageUrl ?? string.Empty,
            AvailabilityStatus = true,
            ShippingInfo = "Free",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return product;
    }

    public async Task<Products> UpdateProductFromShopId(Guid productId, ProductRequest request, Guid shopId)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductId == productId && p.ShopId == shopId);
        if (product == null)
        {
            throw new Exception("Product not found");
        }

        if (request.ImageUrl != null)
        {
            var imageUrl = await _cloudinary.UploadImage(request.ImageUrl);
            product.ProductImageUrl = imageUrl ?? product.ProductImageUrl;
        }

        product.ProductName = request.ProductName;
        product.Description = request.Description;
        product.Price = request.Price;
        product.StockQuantity = request.StockQuantity;
        product.CategoryId = request.CategoryId;
        product.UpdatedAt = DateTime.UtcNow;

        _context.Products.Update(product);
        await _context.SaveChangesAsync();

        return product;
    }

    public async Task<Shops?> GetShopFromUserId(Guid userId)
    {
        var shop = await _context.Shops.FirstOrDefaultAsync(s => s.UserId == userId);
        if (shop == null)
        {
            throw new Exception("Shop not found");
        }

        return shop;
    }

    public async Task<Shops?> UpdateShopImage(Guid shopId, string shopImageUrl)
    {
        var shop = await _context.Shops.FirstOrDefaultAsync(s => s.ShopId == shopId);
        if (shop == null)
        {
            return null;
        }

        shop.ShopImageUrl = shopImageUrl;
        shop.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return shop;
    }

    public async Task<Shops?> UploadShopImage(Guid shopId, Microsoft.AspNetCore.Http.IFormFile file)
    {
        var shop = await _context.Shops.FirstOrDefaultAsync(s => s.ShopId == shopId);
        if (shop == null)
        {
            return null;
        }

        var imageUrl = await _cloudinary.UploadImage(file);
        if (imageUrl != null)
        {
            shop.ShopImageUrl = imageUrl;
            shop.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        return shop;
    }
    
    public async Task<decimal> CalculateOrderRevenueFromShopId(Guid shopId)
    {
        var gross = await _context.OrderItems
            .Where(oi => oi.Product.ShopId == shopId && oi.Status == 1)
            .Select(oi => (decimal?)oi.Price * oi.Quantity) 
            .SumAsync() ?? 0m;

        decimal commissionRate = 0.10m; 
        var commission = Math.Round(gross * commissionRate, 2);
        var netRevenue = gross - commission;

        return netRevenue;
    }
    
    public async Task<int> TotalSoldProductsFromShopId(Guid shopId)
    {
        var totalProductsSold = await _context.OrderItems
            .Where(oi => oi.Product.ShopId == shopId && oi.Status == 1)
            .SumAsync(oi => oi.Quantity);

        return totalProductsSold;
    }
}
