using Microsoft.AspNetCore.Mvc;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.Models;
using PetSitter.Models.Request;
using PetSitter.Utility.Common;

namespace PetSitter.WebApi.Controller;

[ApiController]
[Route("api/[controller]")]
public class ShopController : ControllerBase
{
    private readonly IShopRepository _shopRepository;
    
    public ShopController(IShopRepository shopRepository)
    {
        _shopRepository = shopRepository;
    }

    public class UpdateShopImageRequest
    {
        public string ShopImageUrl { get; set; } = string.Empty;
    }

    [HttpGet("{shopId}/products")]
    public async Task<IActionResult> ListProductFromShopId([FromRoute] Guid shopId)
    {
        var response = new BaseResultResponse<Shops>();
        var shop = await _shopRepository.ListProductFromShopId(shopId);
        if (shop != null)
        {
            response.Success = true;
            response.Message = "List products from shop successful";
            response.Data = shop;
        }
        else
        {
            response.Success = false;
            response.Message = "Shop not found";
            response.Data = null;
        }
        return Ok(response);
    }

    [HttpGet("{shopId}/products/count")]
    public async Task<IActionResult> CountProductFromShopId([FromRoute] Guid shopId)
    {
        var response = new BaseResultResponse<int>();
        var count = await _shopRepository.CountProductFromShopId(shopId);
        response.Success = true;
        response.Message = "Count products from shop successful";
        response.Data = count;
        return Ok(response);
    }

    [HttpGet("{shopId}/orders/count")]
    public async Task<IActionResult> CountOrderFromShopId([FromRoute] Guid shopId)
    {
        var response = new BaseResultResponse<int>();
        var count = await _shopRepository.CountOrderFromShopId(shopId);
        response.Success = true;
        response.Message = "Count orders from shop successful";
        response.Data = count;
        return Ok(response);
    }

    [HttpPost("{shopId}/products")]
    public async Task<IActionResult> AddProductFromShopId([FromRoute] Guid shopId, [FromForm] ProductRequest request)
    {
        var response = new BaseResultResponse<Products>();
        try
        {
            var product = await _shopRepository.AddProductFromShopId(request, shopId);
            response.Success = true;
            response.Message = "Add product to shop successful";
            response.Data = product;
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
            response.Data = null;
        }

        return Ok(response);
    }

    [HttpPut("{shopId}/products/{productId}")]
    public async Task<IActionResult> UpdateProductFromShopId([FromRoute] Guid shopId, [FromRoute] Guid productId,
        [FromForm] ProductRequest request)
    {
        var response = new BaseResultResponse<Products>();
        try
        {
            var product = await _shopRepository.UpdateProductFromShopId(productId, request, shopId);
            response.Success = true;
            response.Message = "Update product in shop successful";
            response.Data = product;
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
            response.Data = null;
        }

        return Ok(response);
    }
    
    [HttpGet("{userId}/shop")]
    public async Task<IActionResult> GetShopFromUserId([FromRoute] Guid userId)
    {
        var response = new BaseResultResponse<Shops?>();
        var shop = await _shopRepository.GetShopFromUserId(userId);
        if (shop != null)
        {
            response.Success = true;
            response.Message = "Get shop from user successful";
            response.Data = shop;
        }
        else
        {
            response.Success = false;
            response.Message = "Shop not found";
            response.Data = null; 
        }
        return Ok(response);
    }

    [HttpPut("{shopId}/image")]
    public async Task<IActionResult> UpdateShopImage([FromRoute] Guid shopId, [FromBody] UpdateShopImageRequest request)
    {
        var response = new BaseResultResponse<Shops?>();

        if (string.IsNullOrWhiteSpace(request.ShopImageUrl))
        {
            response.Success = false;
            response.Message = "Shop image URL is required";
            response.Data = null;
            return BadRequest(response);
        }

        var shop = await _shopRepository.UpdateShopImage(shopId, request.ShopImageUrl.Trim());
        if (shop == null)
        {
            response.Success = false;
            response.Message = "Shop not found";
            response.Data = null;
            return NotFound(response);
        }

        response.Success = true;
        response.Message = "Shop image updated successfully";
        response.Data = shop;
        return Ok(response);
    }

    [HttpPost("{shopId}/image/upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadShopImage([FromRoute] Guid shopId, IFormFile file)
    {
        var response = new BaseResultResponse<Shops?>();

        if (file == null || file.Length == 0)
        {
            response.Success = false;
            response.Message = "No file uploaded";
            response.Data = null;
            return BadRequest(response);
        }

        try
        {
            var shop = await _shopRepository.UploadShopImage(shopId, file);
            if (shop == null)
            {
                response.Success = false;
                response.Message = "Shop not found";
                response.Data = null;
                return NotFound(response);
            }

            response.Success = true;
            response.Message = "Shop image uploaded successfully";
            response.Data = shop;
            return Ok(response);
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
            response.Data = null;
            return Ok(response);
        }
    }

    [HttpGet("{shopId}/orders/revenue")]
    public async Task<IActionResult> CalculateOrderRevenueFromShopId([FromRoute] Guid shopId)
    {
        var response = new BaseResultResponse<decimal>();
        var revenue = await _shopRepository.CalculateOrderRevenueFromShopId(shopId);
        response.Success = true;
        response.Message = "Calculate order revenue from shop successful";
        response.Data = revenue;
        return Ok(response);
    }

    [HttpGet("{shopId}/products/total-sold")]
    public async Task<IActionResult> TotalSoldProductsFromShopId([FromRoute] Guid shopId)
    {
        var response = new BaseResultResponse<int>();
        var totalSold = await _shopRepository.TotalSoldProductsFromShopId(shopId);
        response.Success = true;
        response.Message = "Total sold products from shop successful";
        response.Data = totalSold;
        return Ok(response);
    }
}
