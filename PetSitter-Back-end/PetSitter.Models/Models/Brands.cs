namespace PetSitter.Models.Models;

public class Brands
{
    public Guid BrandId { get; set; }
    public string BrandName { get; set; } = string.Empty;
    
    public virtual ICollection<Products> Products { get; set; } = new List<Products>();
}