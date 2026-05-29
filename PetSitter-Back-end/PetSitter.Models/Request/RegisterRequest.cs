using PetSitter.Models.Enums;

namespace PetSitter.Models.Request;

public class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? DateOfBirth { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string ShopName { get; set; }
    public string Description { get; set; }
    public string BankName { get; set; } = string.Empty;
    public string BankNumber { get; set; } = string.Empty;
}