using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PetSitter.Models.DTO
{
    public class CheckoutRequestDto
    {
        [Required]
        public string FullName { get; set; }

        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public string ShippingAddress { get; set; }

        [Required]
        public List<CartItemDto> CartItems { get; set; }

        public string PaymentMethod { get; set; } = "PayOS";
    }
}
