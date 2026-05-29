using Microsoft.AspNetCore.Http;

namespace PetSitter.Models.Request;

public class ProductRequest
{
    public Guid ShopId { get; set; }
    public Guid CategoryId { get; set; }
    public Guid BrandId { get; set; }
    public Guid TagId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public IFormFile? ImageUrl { get; set; }
    public int StockQuantity { get; set; }
}