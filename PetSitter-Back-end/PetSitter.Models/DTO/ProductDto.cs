namespace PetSitter.Models.DTO;

public class ProductDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ProductImageUrl { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public string Description { get; set; } = string.Empty;
    public bool AvailabilityStatus { get; set; }
    public double Rating { get; set; }
    public int StockQuantity { get; set; }
    public Guid ShopId { get; set; }
    public string ShopName { get; set; } = string.Empty;
    public string ShopImageUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}