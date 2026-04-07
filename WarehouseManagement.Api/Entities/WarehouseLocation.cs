using System.ComponentModel.DataAnnotations;

namespace WarehouseManagement.Api.Entities
{
    public class WarehouseLocation : BaseEntity
    {
        [Required]
        [MaxLength(50)]
        public string Zone { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Shelf { get; set; } = string.Empty;
    }
}
