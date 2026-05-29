using PetSitter.Models.DTO;
using System;
using System.Threading.Tasks;
using Net.payOS.Types; 

namespace PetSitter.Services.Interfaces
{
    public interface IOrderService
    {
        Task<CreatePaymentResult> CreateOrderAndInitiatePayment(CheckoutRequestDto checkoutRequest, Guid userId);
    }
}