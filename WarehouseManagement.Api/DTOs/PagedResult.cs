namespace WarehouseManagement.Api.DTOs
{
    public class PagedResult<T>
    {
        public bool Success { get; set; } = true;
        public List<T> Data { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}
