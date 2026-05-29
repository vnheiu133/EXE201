using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using PetSitter.DataAccess.Repository.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

[Authorize] 
public class ChatHub : Hub
{
    private readonly IChatRepository _chatRepository; 

    public ChatHub(IChatRepository chatRepository)
    {
        _chatRepository = chatRepository;
    }

    // Khi một người dùng gửi tin nhắn
    public async Task SendMessage(string conversationId, string content)
    {
        var senderId = Guid.Parse(Context.UserIdentifier); // Lấy UserId từ token

        // 1. Lưu tin nhắn vào DB
        var message = await _chatRepository.CreateMessageAsync(Guid.Parse(conversationId), senderId, content);

        // 2. Gửi tin nhắn đến tất cả các thành viên trong "nhóm" trò chuyện
        // Mỗi cuộc trò chuyện sẽ là một "nhóm" riêng
        await Clients.Group(conversationId).SendAsync("ReceiveMessage", message);
    }

    // Khi một người dùng muốn tham gia vào một cuộc trò chuyện
    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
    }

    // THÊM HÀM MỚI TẠI ĐÂY
    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
    }
    public async Task UserStartedTyping(string conversationId)
    {
        var senderId = Context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        // Gửi sự kiện đến những người khác trong group, trừ bản thân người gửi
        await Clients.Group(conversationId).SendAsync("ReceiveTypingStatus", senderId, true);
    }

    public async Task UserStoppedTyping(string conversationId)
    {
        var senderId = Context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        // Gửi sự kiện đến những người khác trong group, trừ bản thân người gửi
        await Clients.Group(conversationId).SendAsync("ReceiveTypingStatus", senderId, false);
    }
}