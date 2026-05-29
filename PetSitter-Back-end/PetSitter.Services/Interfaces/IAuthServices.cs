using PetSitter.Models.Models;
using PetSitter.Models.Request;

namespace PetSitter.Services.Interfaces;

public interface IAuthServices
{
    Task<Users> Register(RegisterRequest request);
    Task<Users> Login(LoginRequest request);
}