namespace PetSitter.Models.Models;

public class ServiceTags
{
    public Guid ServiceTagId { get; set; }
    public string TagName { get; set; }
    
    public virtual ICollection<Services> Service { get; set; } = new List<Services>();
}