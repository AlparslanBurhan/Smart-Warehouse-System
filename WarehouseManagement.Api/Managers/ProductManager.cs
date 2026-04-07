using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WarehouseManagement.Api.Data;
using WarehouseManagement.Api.DTOs;
using WarehouseManagement.Api.Entities;
using WarehouseManagement.Api.Repositories;

namespace WarehouseManagement.Api.Managers
{
    public class ProductManager : IProductManager
    {
        private readonly IRepository<Product> _repository;
        private readonly SmartWarehouseDbContext _context;

        public ProductManager(IRepository<Product> repository, SmartWarehouseDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        public async Task<PagedResult<ProductDto>> GetProductsAsync(string companyId, string searchTerm, int page, int pageSize, bool hasStock = false, string zone = "")
        {
            // KURAL 2: Her işlemde CompanyId ile yetkilendirme / filtreleme.
            var query = _repository.Query().Where(x => x.CompanyId == companyId);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(x => x.Name.Contains(searchTerm) || x.SkuCode.Contains(searchTerm));
            }

            // KURAL: Zone bazlı filtreleme (Sadece bakiyesi olanlar baz alınmalı)
            if (!string.IsNullOrWhiteSpace(zone))
            {
                query = query.Where(p => _context.InventoryTransactions
                    .Where(t => t.ProductId == p.Id && t.Location != null && t.Location.Zone == zone && t.CompanyId == companyId)
                    .Select(t => (int?)(t.TransactionType == InventoryTransactionType.In ? t.Quantity : -t.Quantity))
                    .Sum() > 0);
            }

            // KURAL: Stok durumu filtreleme (Sadece toplam stoğu olanlar)
            if (hasStock)
            {
                query = query.Where(p => _context.InventoryTransactions
                    .Where(t => t.ProductId == p.Id && t.CompanyId == companyId)
                    .Select(t => (int?)(t.TransactionType == InventoryTransactionType.In ? t.Quantity : -t.Quantity))
                    .Sum() > 0);
            }

            // KURAL 5: Server-side pagination
            var totalCount = await query.CountAsync();
            
            var data = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ProductDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    SkuCode = x.SkuCode,
                    Description = x.Description,
                    CompanyId = x.CompanyId,
                    Stocks = _context.InventoryTransactions
                        .Where(t => t.ProductId == x.Id && t.CompanyId == companyId)
                        .GroupBy(t => t.Location)
                        .Where(g => g.Key != null)
                        .Select(g => new ProductStockDto
                        {
                            LocationId = g.Key!.Id,
                            LocationName = g.Key.Zone + " - " + g.Key.Shelf,
                            Quantity = ((int?)g.Where(t => t.TransactionType == InventoryTransactionType.In).Sum(t => t.Quantity) ?? 0)
                                     - ((int?)g.Where(t => t.TransactionType == InventoryTransactionType.Out).Sum(t => t.Quantity) ?? 0)
                        })
                        .Where(s => s.Quantity > 0)
                        .ToList()
                })
                .ToListAsync();

            return new PagedResult<ProductDto>
            {
                Success = true,
                Data = data,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };
        }

        public async Task<ProductDto> CreateAsync(ProductCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CompanyId)) throw new ArgumentException("CompanyId is required");

            var product = new Product
            {
                CompanyId = dto.CompanyId,
                Name = dto.Name,
                SkuCode = dto.SkuCode,
                Description = dto.Description
            };

            await _repository.AddAsync(product);

            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                SkuCode = product.SkuCode,
                Description = product.Description,
                CompanyId = product.CompanyId
            };
        }

        public async Task<ProductDto> UpdateAsync(ProductUpdateDto dto)
        {
            var product = await _repository.GetByIdAsync(dto.Id, dto.CompanyId);
            
            // KURAL 2: CompanyId uyuşmuyorsa hata fırlat (Access denied)
            if (product == null) throw new KeyNotFoundException("Product not found or access denied.");

            product.Name = dto.Name;
            product.SkuCode = dto.SkuCode;
            product.Description = dto.Description;

            await _repository.UpdateAsync(product);

            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                SkuCode = product.SkuCode,
                Description = product.Description,
                CompanyId = product.CompanyId
            };
        }

        public async Task DeleteAsync(DeleteDto dto)
        {
            var product = await _repository.GetByIdAsync(dto.Id, dto.CompanyId);
            if (product == null) throw new KeyNotFoundException("Product not found or access denied.");

            await _repository.DeleteAsync(dto.Id, dto.CompanyId);
        }
    }
}
