using Microsoft.AspNetCore.Http;

namespace PetSitter.Models.Request;

public class BlogRequest
{
    public Guid BlogTagId { get; set; }
    public Guid CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int ReadTimeMinutes { get; set; }
    public IFormFile? FeatureImage { get; set; }
}