using Microsoft.AspNetCore.Mvc;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.Models;
using PetSitter.Utility.Common;

namespace PetSitter.WebApi.Controller;

[Route("api/[controller]")]
[ApiController]
public class FilterController : ControllerBase
{
    private readonly IFilterRepository _filterRepository;
    
    public FilterController(IFilterRepository filterRepository)
    {
        _filterRepository = filterRepository;
    }

    [HttpGet("product-tags")]
    public async Task<IActionResult> GetProductTags()
    {
        var response = new BaseResultResponse<List<ProductTags>>();
        
        var productTags = await _filterRepository.ListProductTags();
        response.Success = true;
        response.Message = "Product tags retrieved successfully";
        response.Data = productTags;
        
        return Ok(response);
    }

    [HttpGet("product-brands")]
    public async Task<IActionResult> GetProductBrands()
    {
        var response = new BaseResultResponse<List<Brands>>();
        var productBrands = await _filterRepository.ListProductBrands();
        
        response.Success = true;
        response.Message = "Product brands retrieved successfully";
        response.Data = productBrands;
        return Ok(response);
    }

    [HttpGet("product-categories")]
    public async Task<IActionResult> GetProductCategories()
    {
        var response = new BaseResultResponse<List<Categories>>();
        var productCategories = await _filterRepository.ListProductCategories();
        response.Success = true;
        response.Message = "Product categories retrieved successfully";
        response.Data = productCategories;
        return Ok(response);
    }

    [HttpGet("service-tags")]
    public async Task<IActionResult> GetServiceTags()
    {
        var response = new BaseResultResponse<List<ServiceTags>>();
        var serviceTags = await _filterRepository.ListServiceTags();
        response.Success = true;
        response.Message = "Service tags retrieved successfully";
        response.Data = serviceTags;
        return Ok(response);
    }

    [HttpGet("blog-tags")]
    public async Task<IActionResult> GetBlogTags()
    {
        var response = new BaseResultResponse<List<BlogTags>>();
        var blogTags = await _filterRepository.ListBlogTags();
        response.Success = true;
        response.Message = "Blog tags retrieved successfully";
        response.Data = blogTags;
        return Ok(response);
    }

    [HttpGet("blog-categories")]
    public async Task<IActionResult> GetBlogCategories()
    {
        var response = new BaseResultResponse<List<Categories>>();
        var blogCategories = await _filterRepository.ListBlogCategories();
        response.Success = true;
        response.Message = "Blog categories retrieved successfully";
        response.Data = blogCategories;
        return Ok(response);
    }
}