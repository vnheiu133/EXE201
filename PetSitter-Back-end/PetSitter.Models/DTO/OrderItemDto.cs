using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PetSitter.Models.DTO
{
    public class OrderItemDto
    {
        public Guid ItemId { get; set; }
        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductImage { get; set; }
        public int Quantity { get; set; }
        public decimal Price {  get; set; }
    }
}
