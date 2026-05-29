namespace PetSitter.Models.DTO;

public class BlogDetailDTO
{
    public Guid BlogId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string TagName { get; set; } = string.Empty;
    public string FeaturedImageUrl { get; set; } = string.Empty;
    
    public int ReadTimeMinutes { get; set; }
    public int ViewCount { get; set; }
    public int LikeCount { get; set; }
    public bool HasUserLiked { get; set; }
    public DateTime CreatedAt { get; set; }

    // Author info
    public Guid AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string AuthorAvatar { get; set; } = string.Empty;
    public string AuthorExperience { get; set; } = string.Empty;
}