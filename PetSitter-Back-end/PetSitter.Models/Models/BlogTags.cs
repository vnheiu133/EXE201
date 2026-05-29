namespace PetSitter.Models.Models;

public class BlogTags
{
    public Guid BlogTagId { get; set; }
    public string BlogTagName { get; set; } = string.Empty;

    public virtual ICollection<Blogs> Blogs { get; set; } = new List<Blogs>();
}