using Microsoft.EntityFrameworkCore;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.DTO;
using PetSitter.Models.Models;
using PetSitter.Models.Request;
using PetSitter.Utility.Ex;
using PetSitter.Utility.Utils;

namespace PetSitter.DataAccess.Repository.Implements;

public class BlogRepository : IBlogRepository
{
    private readonly ApplicationDbContext _context;
    private readonly CloudinaryUploader _cloudinary;
    
    public BlogRepository(ApplicationDbContext context, CloudinaryUploader cloudinary)
    {
        _context = context;
        _cloudinary = cloudinary;
    }

    public async Task<List<Blogs>> ListAllBlogs()
    {
        var blogs = await _context.Blogs
            .Select(x => new Blogs
            {
                BlogId = x.BlogId,
                Title = x.Title,
                Content = x.Content,
                TagId = x.TagId,
                BlogTag = new BlogTags
                {
                    BlogTagId = x.BlogTag.BlogTagId,
                    BlogTagName = x.BlogTag.BlogTagName
                },
                ReadTimeMinutes = x.ReadTimeMinutes,
                ViewCount = x.ViewCount,
                LikeCount = x.LikeCount,
                CreatedAt = x.CreatedAt,
                FeaturedImageUrl = x.FeaturedImageUrl,
                AuthorId = x.AuthorId,
                Author = new Users
                {
                    UserId = x.Author.UserId,
                    FullName = x.Author.FullName,
                    ProfilePictureUrl = x.Author.ProfilePictureUrl,
                    Shop = new Shops
                    {
                        ShopId = x.Author.Shop.ShopId,
                        Description = x.Author.Shop.Description
                    }
                }
            })
            .ToListAsync();
        return blogs;
    }
    
    public async Task<Blogs?> IncreaseBlogViewCount(Guid blogId)
    {
        var blog = await _context.Blogs.FirstOrDefaultAsync(x => x.BlogId == blogId);
        if (blog != null)
        {
            blog.ViewCount += 1;
            await _context.SaveChangesAsync();
        }
        return blog;
    }
    
    public async Task<bool> HasUserLiked(Guid blogId, Guid userId)
    {
        return await _context.BlogLikes
            .AnyAsync(x => x.BlogId == blogId && x.UserId == userId);
    }
    
    public async Task<(int likeCount, bool hasLiked)> ToggleLike(Guid blogId, Guid userId)
    {
        var existingLike = await _context.BlogLikes
            .FirstOrDefaultAsync(x => x.BlogId == blogId && x.UserId == userId);

        var blog = await _context.Blogs.FirstOrDefaultAsync(b => b.BlogId == blogId);
        if (blog == null) throw new Exception("Blog not found");

        if (existingLike == null)
        {
            // Chưa like → thêm record
            var like = new BlogLikes
            {
                BlogLikeId = Guid.NewGuid(),
                BlogId = blogId,
                UserId = userId,
                LikedAt = DateTime.UtcNow
            };

            _context.BlogLikes.Add(like);
            blog.LikeCount += 1;
            await _context.SaveChangesAsync();

            return (blog.LikeCount, true);
        }
        else
        {
            _context.BlogLikes.Remove(existingLike);
            blog.LikeCount -= 1;
            await _context.SaveChangesAsync();

            return (blog.LikeCount, false);
        }
    }
    
    public async Task<BlogDetailDTO?> GetBlogDetail(Guid blogId, Guid userId)
    {
        var blog = await _context.Blogs
            .Select(x => new Blogs
            {
                BlogId = x.BlogId,
                Title = x.Title,
                Content = x.Content,
                TagId = x.TagId,
                BlogTag = new BlogTags
                {
                    BlogTagId = x.BlogTag.BlogTagId,
                    BlogTagName = x.BlogTag.BlogTagName
                },
                ReadTimeMinutes = x.ReadTimeMinutes,
                ViewCount = x.ViewCount,
                LikeCount = x.LikeCount,
                CreatedAt = x.CreatedAt,
                FeaturedImageUrl = x.FeaturedImageUrl,
                AuthorId = x.AuthorId,
                Author = new Users
                {
                    UserId = x.Author.UserId,
                    FullName = x.Author.FullName,
                    ProfilePictureUrl = x.Author.ProfilePictureUrl,
                    Shop = new Shops
                    {
                        ShopId = x.Author.Shop.ShopId,
                        Description = x.Author.Shop.Description
                    }
                }
            }).FirstOrDefaultAsync(x => x.BlogId == blogId);
        
        if (blog == null) return null;

        return new BlogDetailDTO
        {
            BlogId = blog.BlogId,
            Title = blog.Title,
            Content = blog.Content,
            TagName = blog.BlogTag.BlogTagName,
            ReadTimeMinutes = blog.ReadTimeMinutes,
            ViewCount = blog.ViewCount,
            LikeCount = blog.LikeCount,
            HasUserLiked = blog.BlogLikes.Any(x => x.UserId == userId),
            CreatedAt = blog.CreatedAt,
            FeaturedImageUrl = blog.FeaturedImageUrl,

            AuthorId = blog.Author.UserId,
            AuthorName = blog.Author.FullName,
            AuthorAvatar = blog.Author.ProfilePictureUrl,
            AuthorExperience = blog.Author.Shop.Description
        };
    }

    public async Task<Blogs> CreateBlog(BlogRequest request, Guid authorId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == authorId);

        if (user == null)
        {
            throw new GlobalException("User not found");
        }

        string? imageUrl = null;
        if (request.FeatureImage != null)
        {
            imageUrl = await _cloudinary.UploadImage(request.FeatureImage);
        }

        var blog = new Blogs
        {
            BlogId = Guid.NewGuid(),
            AuthorId = authorId,
            TagId = request.BlogTagId,
            CategoryId = request.CategoryId,
            Title = request.Title,
            Content = request.Content,
            ReadTimeMinutes = request.ReadTimeMinutes,
            FeaturedImageUrl = imageUrl ?? string.Empty,
            ViewCount = 0,
            LikeCount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Blogs.Add(blog);
        await _context.SaveChangesAsync();
        return blog;
    }
}