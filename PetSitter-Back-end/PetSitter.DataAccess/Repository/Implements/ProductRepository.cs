using Microsoft.EntityFrameworkCore;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.DTO;
using PetSitter.Models.Models;
using PetSitter.Models.Request;
using PetSitter.Utility.Ex;

namespace PetSitter.DataAccess.Repository.Implements;

public class ProductRepository : IProductRepository
{
    private readonly ApplicationDbContext _context;

    public ProductRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> ListAllProducts()
    {
        var product = await _context.Products
            .Select(x => new Products
            {
                ProductId = x.ProductId,
                ProductName = x.ProductName,
                Price = x.Price,
                ProductImageUrl = x.ProductImageUrl,
                Category = new Categories
                {
                    CategoryId = x.Category.CategoryId,
                    CategoryName = x.Category.CategoryName
                },
                Brand = new Brands
                {
                    BrandId = x.Brand.BrandId,
                    BrandName = x.Brand.BrandName
                },
                Tags = new ProductTags
                {
                    ProductTagId = x.Tags.ProductTagId,
                    ProductTagName = x.Tags.ProductTagName
                },
                Description = x.Description,
                AvailabilityStatus = x.AvailabilityStatus,
                Reviews = x.Reviews.Select(r => new ProductReview
                {
                    ReviewId = r.ReviewId,
                    Rating = r.Rating,
                    Comment = r.Comment
                }).ToList(),
                StockQuantity = x.StockQuantity,
                ShopId = x.ShopId,
                Shop = new Shops
                {
                    ShopId = x.Shop.ShopId,
                    ShopName = x.Shop.ShopName,
                    ShopImageUrl = x.Shop.ShopImageUrl
                },
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();

        return product.Select(p => new ProductDto
        {
            ProductId = p.ProductId,
            ProductName = p.ProductName,
            Price = p.Price,
            ProductImageUrl = p.ProductImageUrl,
            CategoryName = p.Category.CategoryName,
            BrandName = p.Brand.BrandName,
            Tags = new List<string> { p.Tags.ProductTagName },
            Description = p.Description,
            AvailabilityStatus = p.AvailabilityStatus,
            Rating = p.Reviews.Any() ? Math.Round(p.Reviews.Average(r => r.Rating), 1) : 0,
            StockQuantity = p.StockQuantity,
            ShopId = p.ShopId,
            ShopName = p.Shop?.ShopName ?? string.Empty,
            ShopImageUrl = p.Shop?.ShopImageUrl ?? string.Empty,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        }).ToList();
    }

    public async Task<Products> PrintProductFromId(Guid productId)
    {
        var product = await _context.Products
            .Where(x => x.ProductId == productId)
            .Select(x => new Products
            {
                ProductId = x.ProductId,
                ProductName = x.ProductName,
                Price = x.Price,
                ProductImageUrl = x.ProductImageUrl,
                Category = new Categories
                {
                    CategoryId = x.Category.CategoryId,
                    CategoryName = x.Category.CategoryName
                },
                Brand = new Brands
                {
                    BrandId = x.Brand.BrandId,
                    BrandName = x.Brand.BrandName
                },
                Tags = new ProductTags
                {
                    ProductTagId = x.Tags.ProductTagId,
                    ProductTagName = x.Tags.ProductTagName
                },
                Description = x.Description,
                AvailabilityStatus = x.AvailabilityStatus,
                StockQuantity = x.StockQuantity,
                ShopId = x.ShopId,
                Shop = new Shops
                {
                    ShopId = x.Shop.ShopId,
                    ShopName = x.Shop.ShopName,
                    ShopImageUrl = x.Shop.ShopImageUrl
                },
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync();
        
        if (product == null)
        {
            throw new GlobalException("Product not found");
        }

        return product;
    }

    public async Task<List<Products>> ListRelatedProductsFromCurrentProduct(Guid productId)
    {
        var currentProduct = await _context.Products
            .Select(x => new Products
            {
                ProductId = x.ProductId,
                ProductName = x.ProductName,
                Price = x.Price,
                ProductImageUrl = x.ProductImageUrl,
                Category = new Categories
                {
                    CategoryId = x.Category.CategoryId,
                    CategoryName = x.Category.CategoryName
                },
                Brand = new Brands
                {
                    BrandId = x.Brand.BrandId,
                    BrandName = x.Brand.BrandName
                },
                Tags = new ProductTags
                {
                    ProductTagId = x.Tags.ProductTagId,
                    ProductTagName = x.Tags.ProductTagName
                },
                Description = x.Description,
                AvailabilityStatus = x.AvailabilityStatus,
                StockQuantity = x.StockQuantity,
                ShopId = x.ShopId,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync(x => x.ProductId == productId);
        
        if (currentProduct == null)
        {
            throw new GlobalException("Product not found");
        }
        
        var relatedProducts = await _context.Products
            .Where(x => (x.CategoryId == currentProduct.Category.CategoryId || x.BrandId == currentProduct.Brand.BrandId ||
                         x.TagId == currentProduct.Tags.ProductTagId) && x.ProductId != productId)
            .Select(x => new Products
            {
                ProductId = x.ProductId,
                ProductName = x.ProductName,
                Price = x.Price,
                ProductImageUrl = x.ProductImageUrl,
                Category = new Categories
                {
                    CategoryId = x.Category.CategoryId,
                    CategoryName = x.Category.CategoryName
                },
                Brand = new Brands
                {
                    BrandId = x.Brand.BrandId,
                    BrandName = x.Brand.BrandName
                },
                Tags = new ProductTags
                {
                    ProductTagId = x.Tags.ProductTagId,
                    ProductTagName = x.Tags.ProductTagName
                },
                Description = x.Description,
                AvailabilityStatus = x.AvailabilityStatus,
                StockQuantity = x.StockQuantity,
                ShopId = x.ShopId,
                Shop = new Shops
                {
                    ShopId = x.Shop.ShopId,
                    ShopName = x.Shop.ShopName,
                    ShopImageUrl = x.Shop.ShopImageUrl
                },
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
        
        return relatedProducts;
    }

    public async Task<List<ProductReview>> ListReviewFromCurrentProduct(Guid productId)
    {
        var reviews = await _context.Reviews.Include(x => x.Users).Where(x => x.ProductId == productId).ToListAsync();
        return reviews;
    }

    public async Task<Products> FindByIdAsync(Guid productId)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null)
        {
            throw new GlobalException("Product not found");
        }
        return product;
    }

    public async Task<List<Products>> GetByIdsAsync(List<Guid> productIds)
    {
        var products = await _context.Products.Where(p => productIds.Contains(p.ProductId)).ToListAsync();
        return products;
    }
    
    public async Task<ProductReview> WriteReviewForProduct(ProductReviewRequest request)
    {
        var product = await _context.Products.FirstOrDefaultAsync(x => x.ProductId == request.ProductId);
        if (product == null)
        {
            throw new Exception("Service not found");
        }
        var review = new ProductReview
        {
            ReviewId = Guid.NewGuid(),
            UserId = request.UserId,
            ProductId = request.ProductId,
            Comment = request.Context,
            Rating = request.Rating,
            CreatedAt = DateTime.UtcNow
        };
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        return review;
    }
}