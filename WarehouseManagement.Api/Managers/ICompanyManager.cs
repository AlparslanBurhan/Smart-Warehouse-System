using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WarehouseManagement.Api.DTOs;

namespace WarehouseManagement.Api.Managers
{
    public interface ICompanyManager
    {
        Task<PagedResult<CompanyDto>> GetCompaniesAsync(string searchTerm, int page, int pageSize);
        Task<CompanyDto> CreateAsync(CompanyCreateDto dto);
        Task<CompanyDto> UpdateAsync(CompanyUpdateDto dto);
        Task DeleteAsync(Guid id);
    }
}
