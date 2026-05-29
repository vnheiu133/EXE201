using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PetSitter.Models.Models
{
    public class Conversation
    {
        public Guid ConversationId { get; set; }
        public Guid PetOwnerId { get; set; } 
        public Guid ShopId { get; set; }
        public DateTime CreatedAt { get; set; }
        public virtual Users PetOwner { get; set; }
        public virtual Shops Shop { get; set; }
        public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}
