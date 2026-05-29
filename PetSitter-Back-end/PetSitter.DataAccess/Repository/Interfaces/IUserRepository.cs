using PetSitter.Models.Models;
using PetSitter.Models.Request;

namespace PetSitter.DataAccess.Repository.Interfaces;

public interface IUserRepository
{
    Task<Users?> ChangeUserPassword(ChangePasswordRequest request);
    Task<Users?> UpdateUserProfile(UserProfileRequest request);
}