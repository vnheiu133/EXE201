using Microsoft.AspNetCore.Mvc;
using PetSitter.Services.Implements;

namespace PetSitter.WebApi.Controller;

[Route("api/[controller]")]
[ApiController]
public class LocationController : ControllerBase
{
    private readonly CountryStateServices _countryStateService;
    
    public LocationController(CountryStateServices countryStateService)
    {
        _countryStateService = countryStateService;
    }
    
    [HttpGet("countries")]
    [ResponseCache(Duration = 86400)] // Cache for 24 hours
    public async Task<IActionResult> GetAllCountries()
    {
        var result = await _countryStateService.GetAllCountries();
        return Content(result, "application/json");
    }
    
    [HttpGet("states/{countryCode}")]
    public async Task<IActionResult> GetStatesByCountry(string countryCode)
    {
        var result = await _countryStateService.GetStatesByCountry(countryCode);
        return Content(result, "application/json");
    }
}