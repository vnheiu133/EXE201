using PetSitter.Models.Models;

namespace PetSitter.DataAccess.Repository.Interfaces;

public interface IFilterRepository
{
    Task<List<ProductTags>> ListProductTags();
    Task<List<Brands>> ListProductBrands();
    Task<List<Categories>> ListProductCategories();
    Task<List<ServiceTags>> ListServiceTags();
    Task<List<BlogTags>> ListBlogTags();
    Task<List<Categories>> ListBlogCategories();
}