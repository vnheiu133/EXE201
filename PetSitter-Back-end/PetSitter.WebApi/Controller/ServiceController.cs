using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.Models;
using PetSitter.Models.Request;
using PetSitter.Utility.Common;
using Service = PetSitter.Models.Models.Services;
namespace PetSitter.WebApi.Controller;

[ApiController]
[Route("api/[controller]")]
public class ServiceController : ControllerBase
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IHubContext<NotificationHub> _notificationHub;
    
    public ServiceController(IServiceRepository serviceRepository, IHubContext<NotificationHub> notificationHub)
    {
        _serviceRepository = serviceRepository;
        _notificationHub = notificationHub;
    }

    [HttpGet("list-services")]
    public async Task<IActionResult> ListAllServices()
    {
        var response = new BaseResultResponse<List<Service>>();
        
        var services = await _serviceRepository.ListAllServices();
        
        if (services != null && services.Count > 0)
        {
            response.Success = true;
            response.Message = "List all services successful";
            response.Data = services;
        }
        else
        {
            response.Success = false;
            response.Message = "No services found";
            response.Data = null;
        }
        return Ok(response);
    }

    [HttpGet("shop/{shopId}")]
    public async Task<IActionResult> ListServicesByShopId([FromRoute] Guid shopId)
    {
        var response = new BaseResultResponse<List<Service>>();
        var services = await _serviceRepository.ListServicesByShopId(shopId);

        response.Success = true;
        response.Message = "List services from shop successful";
        response.Data = services;
        return Ok(response);
    }

    [HttpGet("service/{serviceId}")]
    public async Task<IActionResult> RetrieveServiceFromId([FromRoute] Guid serviceId)
    {
        var response = new BaseResultResponse<Service>();

        var service = await _serviceRepository.RetrieveServiceFromId(serviceId);
        if (service != null)
        {
            response.Success = true;
            response.Message = "Get service successful";
            response.Data = service;
        }
        else
        {
            response.Success = false;
            response.Message = "Service not found";
            response.Data = null;
        }

        return Ok(response);
    }

    [HttpGet("service-reviews/{serviceId}")]
    public async Task<IActionResult> RetrieveServiceReviewsByServiceId([FromRoute] Guid serviceId)
    {
        var response = new BaseResultResponse<List<ServiceReview>>();
        var serviceReviews = await _serviceRepository.RetrieveServiceReviewsByServiceId(serviceId);
        if (serviceReviews != null && serviceReviews.Count > 0)
        {
            response.Success = true;
            response.Message = "Get service reviews successful";
            response.Data = serviceReviews;
        }
        else
        {
            response.Success = false;
            response.Message = "No service reviews found";
            response.Data = null;
        }

        return Ok(response);
    }

    [HttpPost("write-review")]
    public async Task<IActionResult> WriteReviewService([FromBody] ServicesReviewRequest request)
    {
        var response = new BaseResultResponse<ServiceReview>();
        
        try
        {
            var review = await _serviceRepository.WriteReviewService(request);
            response.Success = true;
            response.Message = "Write review successful";
            response.Data = review;
            await _notificationHub.Clients.All.SendAsync("ReceiveNotification", new
            {
                Type = "service-review",
                Title = "Đánh giá dịch vụ mới",
                Message = $"Một khách hàng vừa đánh giá {review.Rating}/5 sao cho dịch vụ.",
                ActorName = "Khách hàng",
                CreatedAt = DateTime.UtcNow.ToString("o")
            });
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
            response.Data = null;
        }
        return Ok(response);
    }
}
