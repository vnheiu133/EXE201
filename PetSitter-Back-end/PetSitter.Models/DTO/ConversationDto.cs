using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PetSitter.Models.DTO
{
    public class ConversationDto
    {
        public Guid ConversationId { get; set; }
        public UserDto PetOwner { get; set; }
        public ShopDto Shop { get; set; }
        public MessageDto LastMessage { get; set; } 
        public DateTime CreatedAt { get; set; }
    }
}
