namespace PetSitter.Models.Models;

public class Wishlist
{
    public Guid WishlistId { get; set; }
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public virtual Users User { get; set; }
    public virtual Products Product { get; set; }
}