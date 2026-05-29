using PetSitter.Models.DTO;
using PetSitter.Models.Models;
using PetSitter.Models.Request;

namespace PetSitter.DataAccess.Repository.Interfaces;

public interface IBlogRepository
{
    Task<List<Blogs>> ListAllBlogs();
    Task<Blogs?> IncreaseBlogViewCount(Guid blogId);
    Task<bool> HasUserLiked(Guid blogId, Guid userId);
    Task<(int likeCount, bool hasLiked)> ToggleLike(Guid blogId, Guid userId);
    Task<BlogDetailDTO?> GetBlogDetail(Guid blogId, Guid userId);
    Task<Blogs> CreateBlog(BlogRequest request, Guid authorId);
}