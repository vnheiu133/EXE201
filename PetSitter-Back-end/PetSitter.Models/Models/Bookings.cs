using PetSitter.Models.Enums;

namespace PetSitter.Models.Models;

public class Bookings
{
    public Guid BookingId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid PetId { get; set; } 
    public DateTime BookingDate { get; set; }
    public BookingStatus Status { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; }

    public virtual Users Customer { get; set; }
    public virtual Pets Pet { get; set; }
    public virtual Services Service { get; set; }
}