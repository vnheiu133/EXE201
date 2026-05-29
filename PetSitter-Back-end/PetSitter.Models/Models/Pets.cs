namespace PetSitter.Models.Models;

public class Pets
{
    public Guid PetId { get; set; }
    public Guid OwnerId { get; set; }
    public string PetName { get; set; } = string.Empty;
    public string PetType { get; set; } = string.Empty; // e.g., Dog, Cat
    public string Breed { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public string? PetPhotoUrl { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public virtual Users Owner { get; set; }
    public virtual ICollection<Bookings> Bookings { get; set; } = new List<Bookings>();
}