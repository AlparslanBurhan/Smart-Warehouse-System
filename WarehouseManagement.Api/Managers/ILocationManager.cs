using System.Threading.Tasks;
using WarehouseManagement.Api.DTOs;

namespace WarehouseManagement.Api.Managers
{
    public interface ILocationManager
    {
        Task<PagedResult<LocationDto>> GetLocationsAsync(string companyId, string searchTerm = "", int page = 1, int pageSize = 25);
        Task<LocationDto> CreateAsync(LocationCreateDto dto);
        Task<LocationDto> UpdateAsync(LocationUpdateDto dto);
        Task DeleteAsync(DeleteDto dto);
        Task CreateBatchAsync(LocationBatchCreateDto dto);
        Task<List<string>> GetZonesAsync(string companyId);
    }
}
