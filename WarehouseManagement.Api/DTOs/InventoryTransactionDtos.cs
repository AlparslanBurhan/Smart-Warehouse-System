using System;

namespace WarehouseManagement.Api.DTOs
{
    public class TransactionRequestDto
    {
        public Guid ProductId { get; set; }
        public Guid LocationId { get; set; }
        public int Quantity { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;
    }

    public class TransactionTransferDto
    {
        public Guid ProductId { get; set; }
        public Guid FromLocationId { get; set; }
        public Guid ToLocationId { get; set; }
        public int Quantity { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;
    }

    public class TransactionLogDto
    {
        public Guid Id { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string LocationName { get; set; } = string.Empty;
        public string TransactionType { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
