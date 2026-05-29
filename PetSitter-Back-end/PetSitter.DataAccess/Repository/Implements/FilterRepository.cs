using Microsoft.EntityFrameworkCore;
using PetSitter.DataAccess.Repository.Interfaces;
using PetSitter.Models.Models;

namespace PetSitter.DataAccess.Repository.Implements;

public class FilterRepository : IFilterRepository
{
    private readonly ApplicationDbContext _context;

    public FilterRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductTags>> ListProductTags()
    {
        return await _context.ProductTags.ToListAsync();
    }

    public async Task<List<Brands>> ListProductBrands()
    {
        return await _context.Brands.ToListAsync();
    }

    public async Task<List<Categories>> ListProductCategories()
    {
        return await _context.Categories.Where(x => x.Products.Any()).Include(x => x.Products).ToListAsync();
    }

    public async Task<List<ServiceTags>> ListServiceTags()
    {   
        return await _context.ServiceTags.ToListAsync();
    }
    
    public async Task<List<BlogTags>> ListBlogTags()
    {
        return await _context.BlogTags.ToListAsync();
    }
    
    public async Task<List<Categories>> ListBlogCategories()
    {
        return await _context.Categories.Where(x => x.Blogs.Any()).Include(x => x.Blogs).ToListAsync();
    }
}