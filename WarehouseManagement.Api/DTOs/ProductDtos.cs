using System;
using System.Collections.Generic;
using System.Linq;

namespace WarehouseManagement.Api.DTOs
{
    public class ProductStockDto
    {
        public Guid LocationId { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }

    public class ProductDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SkuCode { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;
        
        public List<ProductStockDto> Stocks { get; set; } = new();
        public int TotalStock => Stocks.Sum(s => s.Quantity);
    }

    public class ProductCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string SkuCode { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;
    }

    public class ProductUpdateDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SkuCode { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;
    }

    // Ortak silme modeli
    public class DeleteDto 
    {
        public Guid Id { get; set; }
        public string CompanyId { get; set; } = string.Empty;
    }
}
