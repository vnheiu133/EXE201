using PetSitter.Models;
using PetSitter.Models.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PetSitter.DataAccess.Repository.Interfaces
{
    public interface IChatRepository
    {
        Task<Conversation> CreateConversationAsync(Guid petOwnerId, Guid shopId);
        Task<Message> CreateMessageAsync(Guid conversationId, Guid senderId, string content);
        Task<IEnumerable<Conversation>> GetConversationsByUserIdAsync(Guid userId);
        Task<IEnumerable<Message>> GetMessagesByConversationIdAsync(Guid conversationId);
        Task<Conversation> GetConversationByIdAsync(Guid conversationId);
    }
}