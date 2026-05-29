using Microsoft.Extensions.Configuration;
using Net.payOS;
using Net.payOS.Types;
using PetSitter.Services.Interfaces;
using System;
using System.Threading.Tasks;

namespace PetSitter.Services.Implements
{
    public class PayOSService : IPaymentService
    {
        private readonly PayOS _payOS;

        public PayOSService(PayOS payOS)
        {
            _payOS = payOS;
        }

        public async Task<CreatePaymentResult> CreatePaymentLink(PaymentData paymentData)
        {
            try
            {
                CreatePaymentResult paymentResult = await _payOS.createPaymentLink(paymentData);
                return paymentResult;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create PayOS payment link: {ex.Message}");
            }
        }

        public WebhookData VerifyWebhook(WebhookType webhookBody)
        {
            try
            {
                WebhookData verifiedData = _payOS.verifyPaymentWebhookData(webhookBody);
                return verifiedData;
            }
            catch (Exception ex)
            {
                throw new Exception($"Invalid PayOS webhook signature: {ex.Message}");
            }
        }
    }
}