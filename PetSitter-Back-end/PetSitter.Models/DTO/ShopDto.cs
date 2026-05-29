using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PetSitter.Models.DTO
{
    public class ShopDto
    {
        public Guid ShopId { get; set; }
        public string ShopName { get; set; }
        public string ShopImageUrl { get; set; }
        public UserDto User { get; set; } 
    }
}
