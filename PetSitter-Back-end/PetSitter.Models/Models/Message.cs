using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PetSitter.Models.Models
{
    public class Message
    {
        public Guid MessageId { get; set; }
        public Guid ConversationId { get; set; }
        public Guid SenderId { get; set; } // ID của người gửi (là PetOwner hoặc User của Shop)
        public string Content { get; set; }
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;

        public virtual Conversation Conversation { get; set; }
        public virtual Users Sender { get; set; }
    }
}
