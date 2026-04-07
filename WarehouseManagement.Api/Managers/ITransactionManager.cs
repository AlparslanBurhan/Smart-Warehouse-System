using System.Threading.Tasks;
using WarehouseManagement.Api.DTOs;

namespace WarehouseManagement.Api.Managers
{
    public interface ITransactionManager
    {
        Task ProcessInputAsync(TransactionRequestDto dto);
        Task ProcessOutputAsync(TransactionRequestDto dto);
        Task ProcessTransferAsync(TransactionTransferDto dto);
        Task<PagedResult<TransactionLogDto>> GetLogsAsync(string companyId, int page = 1, int pageSize = 50, string transactionType = "");
    }
}
