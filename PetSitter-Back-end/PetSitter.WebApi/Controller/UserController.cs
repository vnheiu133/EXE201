using Microsoft.AspNetCore.Mvc;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.Models;
using PetSitter.Models.Request;
using PetSitter.Utility.Common;

namespace PetSitter.WebApi.Controller;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public UserController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var response = new BaseResultResponse<Users>();

        if (request.UserId == Guid.Empty)
        {
            response.Success = false;
            response.Message = "UserId is required";
            return BadRequest(response);
        }

        var user = await _userRepository.ChangeUserPassword(request);
        if (user == null)
        {
            response.Success = false;
            response.Message = "Old password is incorrect or user not found";
            return BadRequest(response);
        }

        response.Success = true;
        response.Message = "Password changed successfully";
        response.Data = user;
        return Ok(response);
    }

    [HttpPut("update-profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UserProfileRequest request)
    {
        var response = new BaseResultResponse<Users>();

        if (request.UserId == Guid.Empty)
        {
            response.Success = false;
            response.Message = "UserId is required";
            return BadRequest(response);
        }

        var user = await _userRepository.UpdateUserProfile(request);
        if (user == null)
        {
            response.Success = false;
            response.Message = "User not found";
            return NotFound(response);
        }

        response.Success = true;
        response.Message = "Profile updated successfully";
        response.Data = user;
        return Ok(response);
    }
}