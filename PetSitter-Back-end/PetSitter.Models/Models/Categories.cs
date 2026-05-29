namespace PetSitter.Models.Models;

public class Categories
{
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    
    public virtual ICollection<Products> Products { get; set; } = new List<Products>();
    public virtual ICollection<Blogs> Blogs { get; set; } = new List<Blogs>();
}