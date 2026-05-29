namespace PetSitter.Models.Models;

public class BlogLikes
{
    public Guid BlogLikeId { get; set; }
    public Guid BlogId { get; set; }
    public Guid UserId { get; set; }
    public DateTime LikedAt { get; set; }
    
    public virtual Blogs Blogs { get; set; }
    public virtual Users Users { get; set; }
}