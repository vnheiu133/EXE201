using PetSitter.Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PetSitter.DataAccess.Repository.Interfaces
{
    public interface IOrderRepository
    {
        Task<Orders> CreateOrderAsync(Orders order);
        Task<Orders> FindByIdAsync(Guid orderId);
        Task<Orders> FindByOrderCodeAsync(long orderCode);
        Task UpdateOrderAsync(Orders order);
        Task<IEnumerable<Orders>> GetAllOrderAsync();
    }
}
