// PetSitter.WebApi/Controllers/ChatController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.DTO;
using PetSitter.Models.Models;
using System.Security.Claims;

namespace PetSitter.WebApi.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatRepository _chatRepository;

        public ChatController(IChatRepository chatRepository)
        {
            _chatRepository = chatRepository;
        }

        // Lấy danh sách các cuộc trò chuyện của người dùng hiện tại
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var conversations = await _chatRepository.GetConversationsByUserIdAsync(userId);
            // Chuyển đổi từ EF model sang DTO
            var conversationData = conversations.Select(conv => new
            {
                conv.ConversationId,
                PetOwner = new 
                {
                    conv.PetOwner.UserId,
                    conv.PetOwner.FullName,
                    conv.PetOwner.ProfilePictureUrl,
                    Role = (int)conv.PetOwner.Role
                },
                Shop = new 
                {
                    conv.Shop.ShopId,
                    conv.Shop.ShopName,
                    conv.Shop.ShopImageUrl,
                    User = new
                    {
                        conv.Shop.User.UserId,
                        conv.Shop.User.FullName,
                        conv.Shop.User.ProfilePictureUrl,
                        Role = (int)conv.Shop.User.Role
                    } 
                },
                CreatedAt = DateTime.SpecifyKind(conv.CreatedAt, DateTimeKind.Utc).ToString("o"),
                LastMessage = conv.Messages.OrderByDescending(m => m.SentAt).Select(m => new
                {
                    m.MessageId,
                    m.ConversationId,
                    m.SenderId,
                    m.Content,
                    SentAt = DateTime.SpecifyKind(m.SentAt, DateTimeKind.Utc).ToString("o"),
                }).FirstOrDefault()
            }).ToList();

            return Ok(conversationData);
        }

        // Lấy lịch sử tin nhắn của một cuộc trò chuyện
        [HttpGet("conversations/{conversationId}/messages")]
        public async Task<IActionResult> GetMessages(Guid conversationId)
        {
            var messages = await _chatRepository.GetMessagesByConversationIdAsync(conversationId);
            var messageData = messages.Select(m => new {
                m.MessageId,
                m.ConversationId,
                m.SenderId,
                m.Content,
                SentAt = DateTime.SpecifyKind(m.SentAt, DateTimeKind.Utc).ToString("o"),
            m.IsRead
            }).ToList();
            return Ok(messageData);
        }

        [HttpPost("conversations")]
        public async Task<IActionResult> CreateConversation([FromBody] CreateConversationDto dto)
        {
            var petOwnerIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(petOwnerIdString, out var petOwnerId))
            {
                return Unauthorized();
            }

            try
            {
                // Bước 1: Vẫn gọi repo để tạo hoặc lấy conversation.
                var conversationFromRepo = await _chatRepository.CreateConversationAsync(petOwnerId, dto.ShopId);

                // Bước 2: Gọi phương thức mới của repo để lấy dữ liệu đầy đủ
                var fullConversation = await _chatRepository.GetConversationByIdAsync(conversationFromRepo.ConversationId);

                return Ok(fullConversation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while creating conversation: {ex.Message}" });
            }
        }
    }
}