namespace PetSitter.Models.Request;

public class ProductReviewRequest
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }
    public string Context { get; set; } = string.Empty;
    public int Rating { get; set; }
}