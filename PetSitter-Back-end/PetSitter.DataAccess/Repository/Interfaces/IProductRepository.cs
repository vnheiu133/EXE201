using PetSitter.Models.DTO;
using PetSitter.Models.Models;
using PetSitter.Models.Request;

namespace PetSitter.DataAccess.Repository.Interfaces;

public interface IProductRepository
{
    Task<List<ProductDto>> ListAllProducts();
    Task<Products> PrintProductFromId(Guid productId);
    Task<List<Products>> ListRelatedProductsFromCurrentProduct(Guid productId);
    Task<List<ProductReview>> ListReviewFromCurrentProduct(Guid productId);
    Task<Products> FindByIdAsync(Guid productId); //Find 1
    Task<List<Products>> GetByIdsAsync(List<Guid> productIds); //Find all
    Task<ProductReview> WriteReviewForProduct(ProductReviewRequest request);
}