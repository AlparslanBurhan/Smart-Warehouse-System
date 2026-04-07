using System.Threading.Tasks;
using WarehouseManagement.Api.DTOs;

namespace WarehouseManagement.Api.Managers
{
    public interface IProductManager
    {
        Task<PagedResult<ProductDto>> GetProductsAsync(string companyId, string searchTerm, int page, int pageSize, bool hasStock = false, string zone = "");
        Task<ProductDto> CreateAsync(ProductCreateDto dto);
        Task<ProductDto> UpdateAsync(ProductUpdateDto dto);
        Task DeleteAsync(DeleteDto dto);
    }
}
