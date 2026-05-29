using PetSitter.Models.Enums;
using PetSitter.Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PetSitter.Models.DTO
{
    public class OrderDetailDto
    {
        public Guid OrderId { get; set; }
        public Guid ShopId { get; set; }
        public string ShopName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public ICollection<OrderItemDto> Items { get; set; }

    }
}
