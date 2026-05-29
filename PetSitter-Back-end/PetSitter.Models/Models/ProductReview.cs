namespace PetSitter.Models.Models;

public class ProductReview
{
    public Guid ReviewId { get; set; }
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public virtual Users Users { get; set; }
    public virtual Products Product { get; set; }
}