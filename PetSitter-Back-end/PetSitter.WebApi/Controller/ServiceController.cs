using Microsoft.AspNetCore.Mvc;
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
    
    public ServiceController(IServiceRepository serviceRepository)
    {
        _serviceRepository = serviceRepository;
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
