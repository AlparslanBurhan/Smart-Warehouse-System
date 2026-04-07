using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WarehouseManagement.Api.Data;
using WarehouseManagement.Api.DTOs;
using WarehouseManagement.Api.Entities;
using WarehouseManagement.Api.Repositories;

namespace WarehouseManagement.Api.Managers
{
    public class CompanyManager : ICompanyManager
    {
        private readonly IRepository<Company> _repository;
        private readonly SmartWarehouseDbContext _context;

        public CompanyManager(IRepository<Company> repository, SmartWarehouseDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        public async Task<PagedResult<CompanyDto>> GetCompaniesAsync(string searchTerm, int page, int pageSize)
        {
            // KURAL: Server-side pagination and search
            var query = _repository.Query().Where(x => !x.IsDeleted);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(x => x.Name.Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();
            
            var pagedCompanies = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var data = pagedCompanies.Select(x => new CompanyDto
            {
                Id = x.Id,
                Name = x.Name,
                CompanyId = x.CompanyId,
                CreatedAt = x.CreatedAt
            }).ToList();

            return new PagedResult<CompanyDto>
            {
                Success = true,
                Data = data,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };
        }

        public async Task<CompanyDto> CreateAsync(CompanyCreateDto dto)
        {
            var company = new Company
            {
                Name = dto.Name,
                CreatedAt = DateTime.UtcNow
            };

            // KURAL 8: CompanyId zorunluluğu. Şirketin kendisine ID'sini CompanyId olarak atıyoruz.
            company.CompanyId = company.Id.ToString();

            await _repository.AddAsync(company);

            return new CompanyDto
            {
                Id = company.Id,
                Name = company.Name,
                CompanyId = company.CompanyId,
                CreatedAt = company.CreatedAt
            };
        }

        public async Task<CompanyDto> UpdateAsync(CompanyUpdateDto dto)
        {
            var company = await _repository.Query().FirstOrDefaultAsync(x => x.Id == dto.Id && !x.IsDeleted);
            if (company == null) throw new KeyNotFoundException("Company not found.");

            company.Name = dto.Name;
            company.UpdatedAt = DateTime.UtcNow;

            // KURAL 10: EntityState.Modified kuralı
            _context.Entry(company).State = EntityState.Modified;
            await _repository.UpdateAsync(company);

            return new CompanyDto
            {
                Id = company.Id,
                Name = company.Name,
                CompanyId = company.CompanyId,
                CreatedAt = company.CreatedAt
            };
        }

        public async Task DeleteAsync(Guid id)
        {
            var company = await _repository.Query().FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (company == null) throw new KeyNotFoundException("Company not found.");

            // KURAL 9: Soft Delete kuralı
            company.IsDeleted = true;
            company.UpdatedAt = DateTime.UtcNow;

            _context.Entry(company).State = EntityState.Modified;
            await _repository.UpdateAsync(company);
        }
    }
}
