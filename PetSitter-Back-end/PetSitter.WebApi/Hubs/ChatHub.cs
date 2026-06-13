using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.WebApi.Services;
using System.Security.Claims;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatRepository _chatRepository;
    private readonly ChatPresenceService _presenceService;

    public ChatHub(IChatRepository chatRepository, ChatPresenceService presenceService)
    {
        _chatRepository = chatRepository;
        _presenceService = presenceService;
    }

    public override async Task OnConnectedAsync()
    {
        if (Guid.TryParse(Context.UserIdentifier, out var userId))
        {
            var becameOnline = _presenceService.Connect(userId, Context.ConnectionId);
            await _chatRepository.TouchUserActivityAsync(userId);

            if (becameOnline)
            {
                await Clients.All.SendAsync("UserPresenceChanged", userId.ToString(), true, DateTime.UtcNow.ToString("o"));
            }
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (Guid.TryParse(Context.UserIdentifier, out var userId))
        {
            var becameOffline = _presenceService.Disconnect(userId, Context.ConnectionId);
            await _chatRepository.TouchUserActivityAsync(userId);

            if (becameOffline)
            {
                await Clients.All.SendAsync("UserPresenceChanged", userId.ToString(), false, DateTime.UtcNow.ToString("o"));
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(string conversationId, string content)
    {
        var senderId = Guid.Parse(Context.UserIdentifier!);
        var message = await _chatRepository.CreateMessageAsync(Guid.Parse(conversationId), senderId, content);

        await Clients.Group(conversationId).SendAsync("ReceiveMessage", message);
        await Clients.All.SendAsync("UserPresenceChanged", senderId.ToString(), true, DateTime.UtcNow.ToString("o"));
    }

    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
    }

    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
    }

    public async Task UserStartedTyping(string conversationId)
    {
        var senderId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        await Clients.Group(conversationId).SendAsync("ReceiveTypingStatus", senderId, true);
    }

    public async Task UserStoppedTyping(string conversationId)
    {
        var senderId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        await Clients.Group(conversationId).SendAsync("ReceiveTypingStatus", senderId, false);
    }
}
