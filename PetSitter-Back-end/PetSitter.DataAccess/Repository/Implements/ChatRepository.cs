using Microsoft.EntityFrameworkCore;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.Models;
namespace PetSitter.DataAccess.Repository.Implements
{
    public class ChatRepository : IChatRepository
    {
        private readonly ApplicationDbContext _context;

        public ChatRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Conversation> CreateConversationAsync(Guid petOwnerId, Guid shopId)
        {
            // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa để tránh tạo trùng lặp
            var existingConversation = await _context.Conversations
                .FirstOrDefaultAsync(c => c.PetOwnerId == petOwnerId && c.ShopId == shopId);

            if (existingConversation != null)
            {
                return existingConversation;
            }

            // Nếu chưa có, tạo mới
            var newConversation = new Conversation
            {
                PetOwnerId = petOwnerId,
                ShopId = shopId,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Conversations.AddAsync(newConversation);
            await _context.SaveChangesAsync();

            return newConversation;
        }

        public async Task<Message> CreateMessageAsync(Guid conversationId, Guid senderId, string content)
        {
            var message = new Message
            {
                ConversationId = conversationId,
                SenderId = senderId,
                Content = content
            };

            await _context.Messages.AddAsync(message);
            await _context.SaveChangesAsync();

            return message;
        }

        public async Task<IEnumerable<Conversation>> GetConversationsByUserIdAsync(Guid userId)
        {
            // Tìm các conversation IDs mà người dùng có liên quan
            var conversationIds = await _context.Conversations
                .Where(c => c.PetOwnerId == userId || (c.Shop != null && c.Shop.UserId == userId))
                .Select(c => c.ConversationId)
                .ToListAsync();

            if (!conversationIds.Any())
            {
                return new List<Conversation>(); 
            }
            
            var conversation = await _context.Conversations
                .Where(c => conversationIds.Contains(c.ConversationId))
                .Select(x => new Conversation
                {
                    ConversationId = x.ConversationId,
                    PetOwnerId = x.PetOwnerId,
                    ShopId = x.ShopId,
                    CreatedAt = x.CreatedAt,
                    PetOwner = new Users
                    {
                        UserId = x.PetOwner.UserId,
                        FullName = x.PetOwner.FullName,
                        ProfilePictureUrl = x.PetOwner.ProfilePictureUrl
                    },
                    Shop = new Shops
                    {
                        ShopId = x.Shop.ShopId,
                        ShopName = x.Shop.ShopName,
                        UserId = x.Shop.UserId,
                        User = new Users
                        {
                            UserId = x.Shop.User.UserId,
                            FullName = x.Shop.User.FullName,
                            ProfilePictureUrl = x.Shop.User.ProfilePictureUrl
                        }
                    }
                }).ToListAsync();

            // Dựa trên các IDs đó, truy vấn lại để lấy đầy đủ thông tin
            return conversation;
        }

        public async Task<IEnumerable<Message>> GetMessagesByConversationIdAsync(Guid conversationId)
        {
            return await _context.Messages
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.SentAt) // Sắp xếp tin nhắn theo thời gian
                .ToListAsync();
        }

        public async Task<Conversation> GetConversationByIdAsync(Guid conversationId)
        {
            var conversation = await _context.Conversations
                .Select(x => new Conversation
                {
                    ConversationId = x.ConversationId,
                    PetOwnerId = x.PetOwnerId,
                    ShopId = x.ShopId,
                    CreatedAt = x.CreatedAt,
                    PetOwner = new Users
                    {
                        UserId = x.PetOwner.UserId,
                        FullName = x.PetOwner.FullName,
                        ProfilePictureUrl = x.PetOwner.ProfilePictureUrl
                    },
                    Shop = new Shops
                    {
                        ShopId = x.Shop.ShopId,
                        ShopName = x.Shop.ShopName,
                        UserId = x.Shop.UserId,
                        User = new Users
                        {
                            UserId = x.Shop.User.UserId,
                            FullName = x.Shop.User.FullName,
                            ProfilePictureUrl = x.Shop.User.ProfilePictureUrl
                        }
                    }
                }).FirstOrDefaultAsync(x => x.ConversationId == conversationId);
            return conversation!;
        }
    }
}