using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WarehouseManagement.Api.Entities
{
    public class InventoryTransaction : BaseEntity
    {
        public Guid ProductId { get; set; }
        
        [ForeignKey("ProductId")]
        public Product? Product { get; set; }

        public Guid LocationId { get; set; }
        
        [ForeignKey("LocationId")]
        public WarehouseLocation? Location { get; set; }

        [Required]
        public int Quantity { get; set; }

        public InventoryTransactionType TransactionType { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; } = string.Empty;
    }
}
