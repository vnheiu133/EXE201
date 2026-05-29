using Microsoft.AspNetCore;
using Net.payOS.Types;
using System.Threading.Tasks;

namespace PetSitter.Services.Interfaces
{
    public interface IPaymentService
    {
            Task<CreatePaymentResult> CreatePaymentLink(PaymentData paymentData);
            WebhookData VerifyWebhook(WebhookType webhookBody);
        }
}