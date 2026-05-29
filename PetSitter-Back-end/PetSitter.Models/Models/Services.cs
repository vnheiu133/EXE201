namespace PetSitter.Models.Models;

public class Services
{
    public Guid ServiceId { get; set; }
    public Guid ShopId { get; set; }
    public Guid TagId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public decimal PricePerPerson { get; set; }
    public string Description { get; set; } = string.Empty;
    public string ServiceImageUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    public virtual Shops Shop { get; set; }
    public virtual ICollection<Bookings> Bookings { get; set; } = new List<Bookings>();
    public virtual ServiceTags ServiceTags { get; set; }
    public virtual ICollection<ServiceReview> ServiceReviews { get; set; } = new List<ServiceReview>();
}