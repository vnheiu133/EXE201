namespace PetSitter.Models.Models;

public class Blogs
{
    public Guid BlogId { get; set; }
    public Guid AuthorId { get; set; }
    public Guid TagId { get; set; }
    public Guid CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int ReadTimeMinutes { get; set; }
    public int ViewCount { get; set; }
    public int LikeCount { get; set; }
    public string FeaturedImageUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public virtual Users Author { get; set; }
    public virtual BlogTags BlogTag { get; set; }
    public virtual Categories Categories { get; set; }
    public virtual ICollection<BlogLikes> BlogLikes { get; set; } = new List<BlogLikes>();
}