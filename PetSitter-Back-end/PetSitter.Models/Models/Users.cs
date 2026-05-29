using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using PetSitter.Models.Enums;

namespace PetSitter.Models.Models;

public class Users
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    [EmailAddress]
    public string ProfilePictureUrl  { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Address { get; set; } = string.Empty;
    [EmailAddress] public string Email { get; set; } = string.Empty;
    [Phone] public string PhoneNumber { get; set; } = string.Empty;
    [JsonIgnore]
    [Required] public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public virtual Shops Shop { get; set; }
    public virtual ICollection<Blogs> Blogs { get; set; } = new List<Blogs>();
    public virtual ICollection<ProductReview> Reviews { get; set; } = new List<ProductReview>();
    public virtual ICollection<ServiceReview> ServiceReviews { get; set; } = new List<ServiceReview>();
    public virtual ICollection<Orders> Orders { get; set; } = new List<Orders>();
    public virtual ICollection<Pets> Pets { get; set; } = new List<Pets>();
    public virtual ICollection<Bookings> Bookings { get; set; } = new List<Bookings>();
    public virtual ICollection<BlogLikes> BlogLikes { get; set; } = new List<BlogLikes>();
    public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
}
