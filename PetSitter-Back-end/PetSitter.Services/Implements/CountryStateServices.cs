using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace PetSitter.Services.Implements;

public class CountryStateServices
{
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;
    private readonly bool _useMock;
    
    public CountryStateServices(HttpClient client, IConfiguration configuration)
    {
        _httpClient = client;
        _apiKey = configuration["CSCKey:Api"];
        _useMock = bool.TryParse(configuration["Location:UseMock"], out var v) && v;
        if (string.IsNullOrWhiteSpace(_apiKey)) _useMock = true;
    }
    
    public async Task<string> GetAllCountries()
    {
        if (_useMock)
        {
            return GetAllCountriesMock();
        }

        var request = new HttpRequestMessage
        {
            Method = HttpMethod.Get,
            RequestUri = new Uri("https://api.countrystatecity.in/v1/countries"),
            Headers = { { "X-CSCAPI-KEY", _apiKey } }
        };

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        return body;
    }
    
    public async Task<string> GetStatesByCountry(string countryCode)
    {
        if (_useMock)
        {
            return GetStatesByCountryMock(countryCode);
        }

        var request = new HttpRequestMessage
        {
            Method = HttpMethod.Get,
            RequestUri = new Uri($"https://api.countrystatecity.in/v1/countries/{countryCode}/states"),
            Headers = { { "X-CSCAPI-KEY", _apiKey } }
        };

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        return body;
    }
    
    #region Mock data
    private string GetAllCountriesMock()
    {
        var countries = new []
        {
            new { id = 1, name = "Vietnam", iso2 = "VN", iso3 = "VNM", phonecode = "84", capital = "Hanoi", currency = "VND", native = "Việt Nam", emoji = "🇻🇳" },
            new { id = 2, name = "United States", iso2 = "US", iso3 = "USA", phonecode = "1", capital = "Washington", currency = "USD", native = "United States", emoji = "🇺🇸" },
            new { id = 3, name = "Japan", iso2 = "JP", iso3 = "JPN", phonecode = "81", capital = "Tokyo", currency = "JPY", native = "日本", emoji = "🇯🇵" }
        };

        return JsonSerializer.Serialize(countries);
    }

    private string GetStatesByCountryMock(string countryCode)
    {
        // normalize
        countryCode = (countryCode ?? "").Trim().ToUpperInvariant();

        if (countryCode == "VN" || countryCode == "VNM" || countryCode == "VIETNAM")
        {
            var states = new []
            {
                new { id = 1, name = "Hà Nội", iso2 = "HN" },
                new { id = 2, name = "Hồ Chí Minh", iso2 = "HCM" },
                new { id = 3, name = "Đà Nẵng", iso2 = "DN" },
                new { id = 4, name = "Hải Phòng", iso2 = "HP" },
                new { id = 5, name = "Cần Thơ", iso2 = "CT" }
            };
            return JsonSerializer.Serialize(states);
        }

        // fallback small sample for other countries
        if (countryCode == "US" || countryCode == "USA")
        {
            var states = new []
            {
                new { id = 101, name = "California", iso2 = "CA" },
                new { id = 102, name = "New York", iso2 = "NY" },
                new { id = 103, name = "Texas", iso2 = "TX" }
            };
            return JsonSerializer.Serialize(states);
        }

        // default: empty array
        return "[]";
    }
    #endregion

}