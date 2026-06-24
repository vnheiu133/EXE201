using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

[Authorize]
public class NotificationHub : Hub
{
    public async Task BroadcastServiceBooking(string serviceName, string shopName)
    {
        var actorName =
            Context.User?.FindFirstValue(ClaimTypes.Name) ??
            Context.User?.FindFirstValue("fullName") ??
            "Một khách hàng";

        await Clients.All.SendAsync("ReceiveNotification", new
        {
            Type = "service-booking",
            Title = "Yêu cầu dịch vụ mới",
            Message = $"{actorName} vừa yêu cầu tư vấn dịch vụ {serviceName} tại {shopName}.",
            ActorName = actorName,
            CreatedAt = DateTime.UtcNow.ToString("o")
        });
    }
}
