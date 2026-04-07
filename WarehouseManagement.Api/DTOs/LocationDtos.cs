using System;

namespace WarehouseManagement.Api.DTOs
{
    public class LocationDto
    {
        public Guid Id { get; set; }
        public string Zone { get; set; } = string.Empty;
        public string Shelf { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;
    }

    public class LocationCreateDto
    {
        public string Zone { get; set; } = string.Empty;
        public string Shelf { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;
    }

    public class LocationUpdateDto
    {
        public Guid Id { get; set; }
        public string Zone { get; set; } = string.Empty;
        public string Shelf { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;
    }

    public class LocationBatchCreateDto
    {
        public string CompanyId { get; set; } = string.Empty;
        public string Zone { get; set; } = string.Empty;
        public char PrefixStart { get; set; } = 'A';
        public char PrefixEnd { get; set; } = 'A';
        public int NumberEnd { get; set; } = 1;
    }
}
