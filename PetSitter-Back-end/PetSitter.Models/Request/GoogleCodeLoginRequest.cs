namespace PetSitter.Models.Request;

public class GoogleCodeLoginRequest
{
    public string Code { get; set; } = string.Empty;
    public string RedirectUri { get; set; } = string.Empty;
}
