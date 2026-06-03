using System.Globalization;
using Microsoft.EntityFrameworkCore;
using PetSitter.DataAccess;
using PetSitter.Models.Enums;
using PetSitter.Models.Models;
using PetSitter.Models.Request;
using PetSitter.Services.Interfaces;
using PetSitter.Utility.Ex;
using RegisterRequest = PetSitter.Models.Request.RegisterRequest;

namespace PetSitter.Services.Implements;

public class AuthServices : IAuthServices
{
    private const int MinimumPasswordLength = 8;
    private readonly ApplicationDbContext _context;
    
    public AuthServices(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<Users> Register(RegisterRequest request)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (existingUser != null)
        {
            throw new GlobalException("Email already in use");
        }

        if (request.Role == UserRole.Intermediary)
        {
            throw new GlobalException("Intermediary accounts are provisioned by the site owner");
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < MinimumPasswordLength)
        {
            throw new GlobalException($"Password must be at least {MinimumPasswordLength} characters");
        }
        
        Random rnd = new Random();
        //* random image from link
        var imageUrl = new[]
        {
            "https://avatar.iran.liara.run/public/8",
            "https://avatar.iran.liara.run/public/45",
            "https://avatar.iran.liara.run/public/47",
            "https://avatar.iran.liara.run/public/65",
            "https://avatar.iran.liara.run/public/64",
            "https://avatar.iran.liara.run/public/78",
        };

        var user = new Users
        {
            UserId = Guid.NewGuid(),
            FullName = request.FullName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Role = request.Role,
            DateOfBirth = DateTime.ParseExact(
                string.IsNullOrWhiteSpace(request.DateOfBirth) ? "1900-01-01" : request.DateOfBirth,
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture),            
            Address = request.Address,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            ProfilePictureUrl = imageUrl[rnd.Next(imageUrl.Length)],
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        if (user.Role == UserRole.ShopOwner || user.Role == UserRole.Intermediary)
        {
            var shop = new Shops
            {
                ShopId = Guid.NewGuid(),
                UserId = user.UserId,
                ShopName = !string.IsNullOrWhiteSpace(request.ShopName) ? request.ShopName : $"{user.FullName}'s Shop",
                Description = !string.IsNullOrWhiteSpace(request.Description) ? request.Description : "Welcome to our shop!",
                Address = user.Address,
                Location = user.Address.Split(",").FirstOrDefault()?.Trim() ?? user.Address,
                SocialMediaLinks = string.Empty,
                ShopImageUrl = user.ProfilePictureUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                BankName = request.BankName,
                BankNumber = request.BankNumber
            };
            
            _context.Shops.Add(shop);
            await _context.SaveChangesAsync();
        }

        return user;
    }

    public async Task<Users> Login(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);
        
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new GlobalException("Invalid email or password");
        }

        return user;
    }

    public async Task<Users> LoginWithGoogle(string email, string fullName, string profilePictureUrl)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user != null)
        {
            var changed = false;
            if (!string.IsNullOrWhiteSpace(profilePictureUrl) && user.ProfilePictureUrl != profilePictureUrl)
            {
                user.ProfilePictureUrl = profilePictureUrl;
                changed = true;
            }

            if (changed)
            {
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return user;
        }

        user = new Users
        {
            UserId = Guid.NewGuid(),
            FullName = string.IsNullOrWhiteSpace(fullName) ? email.Split('@')[0] : fullName,
            Email = email,
            Role = UserRole.User,
            DateOfBirth = new DateTime(1900, 1, 1),
            Address = string.Empty,
            PhoneNumber = string.Empty,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N")),
            ProfilePictureUrl = profilePictureUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return user;
    }

}
