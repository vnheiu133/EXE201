namespace PetSitter.Models.Models;

public class Shops
{
    public Guid ShopId { get; set; }
    public Guid UserId { get; set; }
    public string ShopName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string SocialMediaLinks { get; set; } = string.Empty;
    public string ShopImageUrl { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string BankNumber { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual Users User { get; set; }
    public virtual ICollection<Products> Products { get; set; } = new List<Products>();
    public virtual ICollection<Services> Services { get; set; } = new List<Services>();
}