using Microsoft.AspNetCore.Mvc;
using Net.payOS.Types;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.Enums;
using PetSitter.Services.Interfaces;
using System;
using System.Threading.Tasks;

namespace PetSitter.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IOrderRepository _orderRepository;

        public PaymentController(IPaymentService paymentService, IOrderRepository orderRepository)
        {
            _paymentService = paymentService;
            _orderRepository = orderRepository;
        }

        [HttpPost("payos-webhook")]
        public async Task<IActionResult> PayOSWebhook([FromBody] WebhookType webhookBody)
        {
            try
            {
                WebhookData verifiedData = _paymentService.VerifyWebhook(webhookBody);

                // Kiểm tra mã code từ dữ liệu đã xác thực
                if (verifiedData.code == "00")
                {
                    var order = await _orderRepository.FindByOrderCodeAsync(verifiedData.orderCode);
                    if (order != null && order.Status == OrderStatus.Pending)
                    {
                        order.Status = OrderStatus.Completed;
                        await _orderRepository.UpdateOrderAsync(order);
                    }
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}