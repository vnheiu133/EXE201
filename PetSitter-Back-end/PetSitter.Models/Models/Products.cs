namespace PetSitter.Models.Models;

public class Products
{
    public Guid ProductId { get; set; }
    public Guid ShopId { get; set; }
    public Guid CategoryId { get; set; }
    public Guid BrandId { get; set; }
    public Guid TagId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public bool AvailabilityStatus { get; set; }
    public string ProductImageUrl { get; set; } = string.Empty;
    public string ShippingInfo { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public virtual Shops Shop { get; set; }
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public virtual ICollection<ProductReview> Reviews { get; set; } = new List<ProductReview>();
    public virtual ProductTags Tags { get; set; }
    public virtual Brands Brand { get; set; }
    public virtual Categories Category { get; set; }
    public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
}