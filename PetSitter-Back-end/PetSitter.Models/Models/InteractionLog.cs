using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PetSitter.Models.Models
{
    public class InteractionLog
    {
        public Guid InteractionLogId { get; set; }
        public Guid UserId { get; set; }
        public Guid? PetId { get; set; }
        public Guid ServiceId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string Action { get; set; } = string.Empty; // "impression","click","book","rating"
        public double Reward { get; set; } // reward value (e.g., book=1, click=0.5, ignore=0, bad rating=-1)
        public string? Meta { get; set; } // optional extra JSON
    }
}
