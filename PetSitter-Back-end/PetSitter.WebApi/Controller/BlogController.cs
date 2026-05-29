using Microsoft.AspNetCore.Mvc;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.DTO;
using PetSitter.Models.Models;
using PetSitter.Models.Request;
using PetSitter.Utility.Common;

namespace PetSitter.WebApi.Controller;

[Route("api/[controller]")]
[ApiController]
public class BlogController : ControllerBase
{
    private readonly IBlogRepository _blogRepository;
    
    public BlogController(IBlogRepository blogRepository)
    {
        _blogRepository = blogRepository;
    }

    [HttpGet("GetAllBlogs")]
    public async Task<IActionResult> GetAllBlogs()
    {
        var response = new BaseResultResponse<List<Blogs>>();
        var blogs = await _blogRepository.ListAllBlogs();
        
        if (blogs == null || !blogs.Any())
        {
            response.Success = false;
            response.Message = "No blogs found.";
            response.Data = new List<Blogs>();
            return NotFound(response);
        }
        
        response.Success = true;
        response.Message = "Blogs retrieved successfully.";
        response.Data = blogs;
        return Ok(response);
    }

    [HttpGet("GetBlogById/{blogId}")]
    public async Task<IActionResult> GetBlogById(Guid blogId, [FromQuery] Guid userId)
    {
        var response = new BaseResultResponse<BlogDetailDTO>();
        var blog = await _blogRepository.GetBlogDetail(blogId, userId);

        if (blog == null)
        {
            response.Success = false;
            response.Message = "Blog not found.";
            response.Data = null;
            return NotFound(response);
        }

        response.Success = true;
        response.Message = "Blog retrieved successfully.";
        response.Data = blog;
        return Ok(response);
    }

    
    [HttpPost("increaseview/{blogId}")]
    public async Task<IActionResult> IncreaseView(Guid blogId)
    {
        var response = new BaseResultResponse<Blogs>();
        var blog = await _blogRepository.IncreaseBlogViewCount(blogId);

        if (blog == null)
        {
            response.Success = false;
            response.Message = "Blog not found.";
            response.Data = null;
            return NotFound(response);
        }

        response.Success = true;
        response.Message = "View count increased.";
        response.Data = blog;
        return Ok(response);
    }

    [HttpPost("ToggleLike/{blogId}")]
    public async Task<IActionResult> ToggleLike(Guid blogId, [FromQuery] Guid userId)
    {
        var response = new BaseResultResponse<object>();

        try
        {
            var (likeCount, hasLiked) = await _blogRepository.ToggleLike(blogId, userId);

            response.Success = true;
            response.Message = hasLiked ? "Blog liked." : "Like removed.";
            response.Data = new { LikeCount = likeCount, HasLiked = hasLiked };

            return Ok(response);
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = ex.Message;
            response.Data = null;
            return BadRequest(response);
        }
    }

    [HttpGet("HasUserLiked/{blogId}")]
    public async Task<IActionResult> HasUserLiked(Guid blogId, [FromQuery] Guid userId)
    {
        var response = new BaseResultResponse<bool>();

        var hasLiked = await _blogRepository.HasUserLiked(blogId, userId);

        response.Success = true;
        response.Message = hasLiked ? "User has liked this blog." : "User has not liked this blog.";
        response.Data = hasLiked;

        return Ok(response);
    }

    [HttpPost("{authorId}/create")]
    public async Task<IActionResult> CreateBlog([FromRoute] Guid authorId, [FromForm] BlogRequest request)
    {
        var response = new BaseResultResponse<Blogs>();

        try
        {
            var blog = await _blogRepository.CreateBlog(request, authorId);
            response.Success = true;
            response.Message = "Blog created successfully.";
            response.Data = blog;
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