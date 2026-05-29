using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetSitter.Models.Models;
using PetSitter.Models.Request;
using PetSitter.Services.Interfaces;
using PetSitter.Utility.Common;
using PetSitter.Utility.Ex;
using System.Security.Claims;

namespace PetSitter.WebApi.Controller;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthServices _authServices;
    private readonly IJwtService _jwtService;

    public AuthController(IAuthServices authServices, IJwtService jwtService)
    {
        _authServices = authServices;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var response = new BaseResultResponse<Users>();
            var user = await _authServices.Register(request);

            if (user != null)
            {
                response.Success = true;
                response.Message = "Registration successful";
                response.Data = user;
            }
            else
            {
                response.Success = false;
                response.Message = "Registration failed";
                response.Data = null;
            }
            return Ok(response);
        }
        catch (GlobalException ex)
        {
            return BadRequest(new { Success = false, Message = ex.Message });
        }
    }

    //[HttpPost("login")]
    //[AllowAnonymous]
    //public async Task<IActionResult> Login([FromBody] LoginRequest request)
    //{
    //    var response = new BaseResultResponse<Users>();

    //    var user = await _authServices.Login(request);
    //    if (user != null)
    //    {
    //        response.Success = true;
    //        response.Message = "Login successful";
    //        response.Data = user;
    //    }
    //    else
    //    {
    //        response.Success = false;
    //        response.Message = "Login failed";
    //        response.Data = null;
    //    }
    //    return Ok(response);
    //}

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = await _authServices.Login(request);
            if (user == null)
            {
                return Unauthorized(new { Success = false, Message = "Invalid email or password" });
            }

            var token = _jwtService.GenerateToken(user.Email, user.UserId);
            
            return Ok(new
            {
                Success = true,
                Message = "Login successful",
                Data = new
                {
                    Token = token,
                    User = user
                }
            });
        }
        catch (GlobalException ex) 
        {
            return Unauthorized(new { Success = false, Message = ex.Message });
        }
    }
}
