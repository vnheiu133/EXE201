using Net.payOS.Types;
using PetSitter.Models.DTO;
using PetSitter.Models.Models;
using System;
using System.Threading.Tasks;

namespace PetSitter.Services.Interfaces
{
    public interface IOrderService
    {
        Task<CreatePaymentResult> CreateOrderAndInitiatePayment(CheckoutRequestDto checkoutRequest, Guid userId);
        Task<Orders> CreateCashOnDeliveryOrder(CheckoutRequestDto checkoutRequest, Guid userId);
    }
}
