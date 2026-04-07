using System;

namespace WarehouseManagement.Api.DTOs
{
    public class CompanyDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CompanyCreateDto
    {
        public string Name { get; set; } = string.Empty;
    }

    public class CompanyUpdateDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
