using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.Models;
using PetSitter.Models.Request;
using PetSitter.Utility.Ex;

namespace PetSitter.DataAccess.Repository.Implements;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;
    
    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Users?> ChangeUserPassword(ChangePasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.OldPassword) || string.IsNullOrEmpty(request.NewPassword) || string.IsNullOrEmpty(request.ConfirmPassword))
        {
            throw new GlobalException("Password must be provided");
        }

        if (request.NewPassword.Length < 8)
        {
            throw new GlobalException("New password must be at least 8 characters");
        }

        var user = await _context.Users.FindAsync(request.UserId);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
        {
            return null;
        }

        if (request.OldPassword == request.NewPassword)
        {
            throw new GlobalException("New password must be different from the old password");
        }
        
        if (request.NewPassword != request.ConfirmPassword)
        {
            throw new GlobalException("New password and confirm password do not match");
        }
        
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<Users?> UpdateUserProfile(UserProfileRequest request)
    {
        var user = await _context.Users.FindAsync(request.UserId);
        if (user == null)
        {
            return null;
        }
        user.FullName = request.FullName;
        user.PhoneNumber = request.PhoneNumber;
        user.DateOfBirth = request.DateOfBirth ?? user.DateOfBirth;
        user.Address = request.Address;
        user.Email = request.Email;
        user.UpdatedAt = DateTime.UtcNow;
        
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        
        return user;
    }
}
