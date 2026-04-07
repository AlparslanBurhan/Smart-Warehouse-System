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
    public class LocationManager : ILocationManager
    {
        private readonly IRepository<WarehouseLocation> _repository;
        private readonly SmartWarehouseDbContext _context;

        public LocationManager(IRepository<WarehouseLocation> repository, SmartWarehouseDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        public async Task<PagedResult<LocationDto>> GetLocationsAsync(string companyId, string searchTerm = "", int page = 1, int pageSize = 25)
        {
            var query = _repository.Query().Where(x => x.CompanyId == companyId);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(x => x.Zone.Contains(searchTerm) || x.Shelf.Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();

            var data = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new LocationDto
                {
                    Id = x.Id,
                    Zone = x.Zone,
                    Shelf = x.Shelf,
                    CompanyId = x.CompanyId
                })
                .ToListAsync();

            return new PagedResult<LocationDto>
            {
                Success = true,
                Data = data,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };
        }

        public async Task<LocationDto> CreateAsync(LocationCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CompanyId)) throw new ArgumentException("CompanyId is required");

            var location = new WarehouseLocation
            {
                CompanyId = dto.CompanyId,
                Zone = dto.Zone,
                Shelf = dto.Shelf
            };

            await _repository.AddAsync(location);

            return new LocationDto
            {
                Id = location.Id,
                Zone = location.Zone,
                Shelf = location.Shelf,
                CompanyId = location.CompanyId
            };
        }

        public async Task<LocationDto> UpdateAsync(LocationUpdateDto dto)
        {
            var location = await _repository.GetByIdAsync(dto.Id, dto.CompanyId);

            if (location == null) throw new KeyNotFoundException("Location not found or access denied.");

            location.Zone = dto.Zone;
            location.Shelf = dto.Shelf;

            await _repository.UpdateAsync(location);

            return new LocationDto
            {
                Id = location.Id,
                Zone = location.Zone,
                Shelf = location.Shelf,
                CompanyId = location.CompanyId
            };
        }

        public async Task DeleteAsync(DeleteDto dto)
        {
            var location = await _repository.GetByIdAsync(dto.Id, dto.CompanyId);
            if (location == null) throw new KeyNotFoundException("Location not found or access denied.");

            await _repository.DeleteAsync(dto.Id, dto.CompanyId);
        }

        public async Task CreateBatchAsync(LocationBatchCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CompanyId)) throw new ArgumentException("CompanyId is required");

            char start = char.ToUpper(dto.PrefixStart);
            char end = char.ToUpper(dto.PrefixEnd);

            if (start > end) throw new ArgumentException("PrefixStart harfi PrefixEnd'den büyük olamaz.");
            if (dto.NumberEnd < 1) throw new ArgumentException("NumberEnd en az 1 olmalıdır.");

            var locations = new List<WarehouseLocation>();

            for (char prefix = start; prefix <= end; prefix++)
            {
                for (int num = 1; num <= dto.NumberEnd; num++)
                {
                    locations.Add(new WarehouseLocation
                    {
                        CompanyId = dto.CompanyId,
                        Zone = dto.Zone,
                        Shelf = $"{prefix}-{num}"
                    });
                }
            }

            await _context.WarehouseLocations.AddRangeAsync(locations);
            await _context.SaveChangesAsync();
        }

        public async Task<List<string>> GetZonesAsync(string companyId)
        {
            return await _context.WarehouseLocations
                .Where(x => x.CompanyId == companyId)
                .Select(x => x.Zone)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();
        }
    }
}
