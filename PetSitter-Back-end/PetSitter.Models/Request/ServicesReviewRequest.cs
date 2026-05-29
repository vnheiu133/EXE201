namespace PetSitter.Models.Request;

public class ServicesReviewRequest
{
    public Guid UserId { get; set; }
    public Guid ServiceId { get; set; }
    public string Context { get; set; } = string.Empty;
    public int Rating { get; set; }
}