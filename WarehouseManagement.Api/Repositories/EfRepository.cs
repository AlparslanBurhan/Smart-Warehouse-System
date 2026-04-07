using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WarehouseManagement.Api.Data;
using WarehouseManagement.Api.Entities;

namespace WarehouseManagement.Api.Repositories
{
    public class EfRepository<T> : IRepository<T> where T : BaseEntity
    {
        private readonly SmartWarehouseDbContext _context;

        public EfRepository(SmartWarehouseDbContext context)
        {
            _context = context;
        }

        public IQueryable<T> Query()
        {
            // Global Query Filters (IsDeleted) devreye girecektir.
            return _context.Set<T>().AsQueryable();
        }

        public async Task<T?> GetByIdAsync(Guid id, string companyId)
        {
            return await _context.Set<T>()
                .FirstOrDefaultAsync(x => x.Id == id && x.CompanyId == companyId);
        }

        public async Task<T> AddAsync(T entity)
        {
            await _context.Set<T>().AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task UpdateAsync(T entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;
            
            // KURAL 4: Güncelleme işlemlerinde EntityState.Modified mutlaka kullanılmalıdır.
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id, string companyId)
        {
            var entity = await GetByIdAsync(id, companyId);
            if (entity != null)
            {
                // KURAL: Silme işlemleri soft delete (IsDeleted) ile yapılmalı
                entity.IsDeleted = true;
                entity.UpdatedAt = DateTime.UtcNow;
                _context.Entry(entity).State = EntityState.Modified;
                await _context.SaveChangesAsync();
            }
        }
    }
}
