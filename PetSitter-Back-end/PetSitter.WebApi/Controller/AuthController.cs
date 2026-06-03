using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth;
using PetSitter.Models.Models;
using PetSitter.Models.Request;
using PetSitter.Services.Interfaces;
using PetSitter.Utility.Common;
using PetSitter.Utility.Ex;
using System.Security.Claims;
using System.Text.Json;

namespace PetSitter.WebApi.Controller;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthServices _authServices;
    private readonly IJwtService _jwtService;
    private readonly IConfiguration _configuration;

    public AuthController(IAuthServices authServices, IJwtService jwtService, IConfiguration configuration)
    {
        _authServices = authServices;
        _jwtService = jwtService;
        _configuration = configuration;
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

    [HttpPost("google-login")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.IdToken))
            {
                return BadRequest(new { Success = false, Message = "Google id token is required" });
            }

            var googleClientId = _configuration["GoogleAuth:ClientId"];
            if (string.IsNullOrWhiteSpace(googleClientId))
            {
                return StatusCode(500, new { Success = false, Message = "Google client id is not configured" });
            }

            var payload = await GoogleJsonWebSignature.ValidateAsync(
                request.IdToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { googleClientId }
                });

            if (!payload.EmailVerified)
            {
                return Unauthorized(new { Success = false, Message = "Google email is not verified" });
            }

            var user = await _authServices.LoginWithGoogle(payload.Email, payload.Name, payload.Picture);
            var token = _jwtService.GenerateToken(user.Email, user.UserId);

            return Ok(new
            {
                Success = true,
                Message = "Google login successful",
                Data = new
                {
                    Token = token,
                    User = user
                }
            });
        }
        catch (InvalidJwtException)
        {
            return Unauthorized(new { Success = false, Message = "Invalid Google token" });
        }
        catch (GlobalException ex)
        {
            return Unauthorized(new { Success = false, Message = ex.Message });
        }
    }

    [HttpPost("google-code-login")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleCodeLogin([FromBody] GoogleCodeLoginRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Code))
            {
                return BadRequest(new { Success = false, Message = "Google authorization code is required" });
            }

            var googleClientId = _configuration["GoogleAuth:ClientId"];
            var googleClientSecret = _configuration["GoogleAuth:ClientSecret"];
            if (string.IsNullOrWhiteSpace(googleClientId) || string.IsNullOrWhiteSpace(googleClientSecret))
            {
                return StatusCode(500, new { Success = false, Message = "Google OAuth is not configured" });
            }

            var redirectUri = string.IsNullOrWhiteSpace(request.RedirectUri)
                ? "http://localhost:5100/signin-google"
                : request.RedirectUri;

            using var httpClient = new HttpClient();
            using var tokenResponse = await httpClient.PostAsync(
                "https://oauth2.googleapis.com/token",
                new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["client_id"] = googleClientId,
                    ["client_secret"] = googleClientSecret,
                    ["code"] = request.Code,
                    ["redirect_uri"] = redirectUri,
                    ["grant_type"] = "authorization_code"
                }));

            var tokenJson = await tokenResponse.Content.ReadAsStringAsync();
            if (!tokenResponse.IsSuccessStatusCode)
            {
                var googleMessage = "Không thể đổi mã xác thực Google";
                try
                {
                    using var errorDocument = JsonDocument.Parse(tokenJson);
                    if (errorDocument.RootElement.TryGetProperty("error_description", out var description))
                    {
                        googleMessage = description.GetString() ?? googleMessage;
                    }
                    else if (errorDocument.RootElement.TryGetProperty("error", out var error))
                    {
                        googleMessage = error.GetString() ?? googleMessage;
                    }
                }
                catch
                {
                    // Keep the generic message if Google returns a non-JSON error response.
                }

                return Unauthorized(new { Success = false, Message = googleMessage });
            }

            using var tokenDocument = JsonDocument.Parse(tokenJson);
            if (!tokenDocument.RootElement.TryGetProperty("id_token", out var idTokenElement))
            {
                return Unauthorized(new { Success = false, Message = "Google did not return an id token" });
            }

            return await GoogleLogin(new GoogleLoginRequest { IdToken = idTokenElement.GetString() ?? string.Empty });
        }
        catch (InvalidJwtException)
        {
            return Unauthorized(new { Success = false, Message = "Invalid Google token" });
        }
        catch (GlobalException ex)
        {
            return Unauthorized(new { Success = false, Message = ex.Message });
        }
    }
}
