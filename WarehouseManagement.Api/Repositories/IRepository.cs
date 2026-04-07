using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using WarehouseManagement.Api.Entities;

namespace WarehouseManagement.Api.Repositories
{
    public interface IRepository<T> where T : BaseEntity
    {
        IQueryable<T> Query();
        Task<T?> GetByIdAsync(Guid id, string companyId);
        Task<T> AddAsync(T entity);
        Task UpdateAsync(T entity); // Kural gereği EntityState.Modified kullanacak
        Task DeleteAsync(Guid id, string companyId);
    }
}
