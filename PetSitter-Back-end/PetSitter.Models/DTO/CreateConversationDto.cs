using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PetSitter.Models.DTO
{
    public class CreateConversationDto
    {
        [Required]
        public Guid ShopId { get; set; }
    }
}
