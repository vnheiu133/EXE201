using Microsoft.AspNetCore.Mvc;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.DTO;
using PetSitter.Models.Models;
using PetSitter.Models.Request;
using PetSitter.Utility.Common;

namespace PetSitter.WebApi.Controller;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly IProductRepository _productRepository;
    
    public ProductController(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    [HttpGet("list-products")]
    public async Task<IActionResult> ListAllProducts()
    {
        var response = new BaseResultResponse<List<ProductDto>>();
        
        var products = await _productRepository.ListAllProducts();
        
        if (products != null && products.Count > 0)
        {
            response.Success = true;
            response.Message = "List all products successful";
            response.Data = products;
        }
        else
        {
            response.Success = false;
            response.Message = "No products found";
            response.Data = null;
        }
        return Ok(response);
    }
    
    [HttpGet("product/{productId}")]
    public async Task<IActionResult> PrintProductFromId([FromRoute] Guid productId)
    {
        var response = new BaseResultResponse<Products>();
        
        var product = await _productRepository.PrintProductFromId(productId);
        
        if (product != null)
        {
            response.Success = true;
            response.Message = "Get product successful";
            response.Data = product;
        }
        else
        {
            response.Success = false;
            response.Message = "Product not found";
            response.Data = null;
        }
        return Ok(response);
    }
    
    [HttpGet("related-products/{productId}")]
    public async Task<IActionResult> ListRelatedProducts([FromRoute] Guid productId)
    {
        var response = new BaseResultResponse<List<Products>>();
        
        var relatedProducts = await _productRepository.ListRelatedProductsFromCurrentProduct(productId);
        
        if (relatedProducts != null && relatedProducts.Count > 0)
        {
            response.Success = true;
            response.Message = "List related products successful";
            response.Data = relatedProducts;
        }
        else
        {
            response.Success = false;
            response.Message = "No related products found";
            response.Data = null;
        }
        return Ok(response);
    }

    [HttpGet("reviews/{productId}")]
    public async Task<IActionResult> ListReviewsFromCurrentProduct([FromRoute] Guid productId)
    {
        var response = new BaseResultResponse<List<ProductReview>>();

        var reviews = await _productRepository.ListReviewFromCurrentProduct(productId);

        if (reviews != null && reviews.Count > 0)
        {
            response.Success = true;
            response.Message = "List reviews successful";
            response.Data = reviews;
        }
        else
        {
            response.Success = false;
            response.Message = "No reviews found";
            response.Data = null;
        }

        return Ok(response);
    }

    [HttpPost("write-review")]
    public async Task<IActionResult> WriteReviewForProduct([FromBody] ProductReviewRequest request)
    {
        var response = new BaseResultResponse<ProductReview>();
        
        try
        {
            var review = await _productRepository.WriteReviewForProduct(request);
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