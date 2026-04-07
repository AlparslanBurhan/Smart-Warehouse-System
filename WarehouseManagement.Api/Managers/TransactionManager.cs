using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WarehouseManagement.Api.Data;
using WarehouseManagement.Api.DTOs;
using WarehouseManagement.Api.Entities;

namespace WarehouseManagement.Api.Managers
{
    public class TransactionManager : ITransactionManager
    {
        private readonly SmartWarehouseDbContext _context;

        public TransactionManager(SmartWarehouseDbContext context)
        {
            _context = context;
        }

        public async Task ProcessInputAsync(TransactionRequestDto dto)
        {
            // Verify product and location belong to the company
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId && p.CompanyId == dto.CompanyId);
            if (product == null) throw new KeyNotFoundException("Product not found or access denied.");

            var location = await _context.WarehouseLocations.FirstOrDefaultAsync(l => l.Id == dto.LocationId && l.CompanyId == dto.CompanyId);
            if (location == null) throw new KeyNotFoundException("Location not found or access denied.");

            var transaction = new InventoryTransaction
            {
                CompanyId = dto.CompanyId,
                ProductId = dto.ProductId,
                LocationId = dto.LocationId,
                Quantity = dto.Quantity,
                TransactionType = InventoryTransactionType.In,
                Notes = dto.Notes
            };

            await _context.InventoryTransactions.AddAsync(transaction);
            await _context.SaveChangesAsync();
        }

        public async Task ProcessOutputAsync(TransactionRequestDto dto)
        {
            var productExists = await _context.Products.AnyAsync(p => p.Id == dto.ProductId && p.CompanyId == dto.CompanyId);
            if (!productExists) throw new KeyNotFoundException("Product not found or access denied.");

            // Calculate current stock at location in one query
            var currentStock = await _context.InventoryTransactions
                .Where(t => t.ProductId == dto.ProductId && t.LocationId == dto.LocationId && t.CompanyId == dto.CompanyId)
                .SumAsync(t => t.TransactionType == InventoryTransactionType.In ? t.Quantity : -t.Quantity);

            if (currentStock < dto.Quantity)
                throw new InvalidOperationException("Not enough stock in the specified location.");

            var transaction = new InventoryTransaction
            {
                CompanyId = dto.CompanyId,
                ProductId = dto.ProductId,
                LocationId = dto.LocationId,
                Quantity = dto.Quantity,
                TransactionType = InventoryTransactionType.Out,
                Notes = dto.Notes
            };

            await _context.InventoryTransactions.AddAsync(transaction);
            await _context.SaveChangesAsync();
        }
        public async Task ProcessTransferAsync(TransactionTransferDto dto)
        {
            // Verify product, source and destination locations belong to company
            var checkItems = await _context.Products.Where(p => p.Id == dto.ProductId && p.CompanyId == dto.CompanyId).Select(p => new { Type = "P", p.Id })
                .Union(_context.WarehouseLocations.Where(l => l.Id == dto.FromLocationId && l.CompanyId == dto.CompanyId).Select(l => new { Type = "F", l.Id }))
                .Union(_context.WarehouseLocations.Where(l => l.Id == dto.ToLocationId && l.CompanyId == dto.CompanyId).Select(l => new { Type = "T", l.Id }))
                .ToListAsync();

            if (!checkItems.Any(x => x.Type == "P")) throw new KeyNotFoundException("Product not found or access denied.");
            if (!checkItems.Any(x => x.Type == "F")) throw new KeyNotFoundException("Source Location not found or access denied.");
            if (!checkItems.Any(x => x.Type == "T")) throw new KeyNotFoundException("Destination Location not found or access denied.");

            var srcLoc = await _context.WarehouseLocations.FirstAsync(l => l.Id == dto.FromLocationId);
            var destLoc = await _context.WarehouseLocations.FirstAsync(l => l.Id == dto.ToLocationId);

            // Calculate current stock at FROM location in one query
            var currentStock = await _context.InventoryTransactions
                .Where(t => t.ProductId == dto.ProductId && t.LocationId == dto.FromLocationId && t.CompanyId == dto.CompanyId)
                .SumAsync(t => t.TransactionType == InventoryTransactionType.In ? t.Quantity : -t.Quantity);

            if (currentStock < dto.Quantity)
                throw new InvalidOperationException("Not enough stock in the source location for transfer.");

            using var dbTransaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var transactionOut = new InventoryTransaction
                {
                    CompanyId = dto.CompanyId,
                    ProductId = dto.ProductId,
                    LocationId = dto.FromLocationId,
                    Quantity = dto.Quantity,
                    TransactionType = InventoryTransactionType.Out,
                    Notes = $"Transfer Out -> Dest: {destLoc.Zone}-{destLoc.Shelf} | " + dto.Notes
                };

                var transactionIn = new InventoryTransaction
                {
                    CompanyId = dto.CompanyId,
                    ProductId = dto.ProductId,
                    LocationId = dto.ToLocationId,
                    Quantity = dto.Quantity,
                    TransactionType = InventoryTransactionType.In,
                    Notes = $"Transfer In <- Src: {srcLoc.Zone}-{srcLoc.Shelf} | " + dto.Notes
                };

                await _context.InventoryTransactions.AddAsync(transactionOut);
                await _context.InventoryTransactions.AddAsync(transactionIn);
                
                await _context.SaveChangesAsync();
                await dbTransaction.CommitAsync();
            }
            catch
            {
                await dbTransaction.RollbackAsync();
                throw;
            }
        }

        public async Task<PagedResult<TransactionLogDto>> GetLogsAsync(string companyId, int page = 1, int pageSize = 50, string transactionType = "")
        {
            var query = _context.InventoryTransactions
                .Include(t => t.Product)
                .Include(t => t.Location)
                .Where(t => t.CompanyId == companyId);

            if (!string.IsNullOrWhiteSpace(transactionType))
            {
                if (Enum.TryParse<InventoryTransactionType>(transactionType, true, out var typeEnum))
                {
                    query = query.Where(t => t.TransactionType == typeEnum);
                }
            }

            query = query.OrderByDescending(t => t.CreatedAt);

            var totalCount = await query.CountAsync();

            var data = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new TransactionLogDto
                {
                    Id = t.Id,
                    ProductName = t.Product != null ? t.Product.Name : "—",
                    LocationName = t.Location != null ? (t.Location.Zone + " - " + t.Location.Shelf) : "—",
                    TransactionType = t.TransactionType.ToString(),
                    Quantity = t.Quantity,
                    Notes = t.Notes,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();

            return new PagedResult<TransactionLogDto>
            {
                Success = true,
                Data = data,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };
        }
    }
}
