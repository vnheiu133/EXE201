using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace PetSitter.Models.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum UserRole
{
    [EnumMember(Value = "user")]
    User = 1,

    [EnumMember(Value = "shop")]
    ShopOwner = 2,

    [EnumMember(Value = "intermediary")]
    Intermediary = 3
}