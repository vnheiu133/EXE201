namespace PetSitter.Models.Models;

public class ServiceReview
{
    public Guid ReviewId { get; set; }
    public Guid UserId { get; set; }
    public Guid ServiceId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    public virtual Users Users { get; set; }
    public virtual Services Service { get; set; }
}