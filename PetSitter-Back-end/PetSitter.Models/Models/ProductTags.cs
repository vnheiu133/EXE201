namespace PetSitter.Models.Models;

public class ProductTags
{
    public Guid ProductTagId { get; set; }
    public string ProductTagName { get; set; }
    
    public virtual ICollection<Products> Products { get; set; } = new List<Products>();
}