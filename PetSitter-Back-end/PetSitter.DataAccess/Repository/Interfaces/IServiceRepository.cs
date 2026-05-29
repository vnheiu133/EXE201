using PetSitter.Models.Models;
using PetSitter.Models.Request;

namespace PetSitter.DataAccess.Repository.Interfaces;

public interface IServiceRepository
{
    Task<List<Services>> ListAllServices();
    Task<List<Services>> ListServicesByShopId(Guid shopId);
    Task<Services?> RetrieveServiceFromId(Guid serviceId);
    Task<List<ServiceReview>> RetrieveServiceReviewsByServiceId(Guid serviceId);
    Task<ServiceReview> WriteReviewService(ServicesReviewRequest request);
}
