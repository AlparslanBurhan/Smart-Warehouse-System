using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WarehouseManagement.Api.DTOs;
using WarehouseManagement.Api.Managers;

namespace WarehouseManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LocationController : ControllerBase
    {
        private readonly ILocationManager _manager;

        public LocationController(ILocationManager manager)
        {
            _manager = manager;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetLocations([FromQuery] string companyId, [FromQuery] string searchTerm = "", [FromQuery] int page = 1, [FromQuery] int pageSize = 25)
        {
            if (string.IsNullOrWhiteSpace(companyId)) return BadRequest(new { success = false, message = "CompanyId is required" });

            var result = await _manager.GetLocationsAsync(companyId, searchTerm, page, pageSize);
            return Ok(result);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] LocationCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CompanyId)) return BadRequest(new { success = false, message = "CompanyId is required" });

            try
            {
                var result = await _manager.CreateAsync(dto);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] LocationUpdateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CompanyId)) return BadRequest(new { success = false, message = "CompanyId is required" });

            try
            {
                var result = await _manager.UpdateAsync(dto);
                return Ok(new { success = true, data = result });
            }
            catch (KeyNotFoundException)
            {
                return StatusCode(403, new { success = false, message = "Access denied or location not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("delete")]
        public async Task<IActionResult> Delete([FromBody] DeleteDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CompanyId)) return BadRequest(new { success = false, message = "CompanyId is required" });

            try
            {
                await _manager.DeleteAsync(dto);
                return Ok(new { success = true, message = "Location deleted successfully" });
            }
            catch (KeyNotFoundException)
            {
                return StatusCode(403, new { success = false, message = "Access denied or location not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("create-batch")]
        public async Task<IActionResult> CreateBatch([FromBody] LocationBatchCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CompanyId)) return BadRequest(new { success = false, message = "CompanyId is required" });

            try
            {
                await _manager.CreateBatchAsync(dto);
                return Ok(new { success = true, message = "Toplu lokasyon başarıyla oluşturuldu." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
        [HttpGet("zones")]
        public async Task<IActionResult> GetZones([FromQuery] string companyId)
        {
            if (string.IsNullOrWhiteSpace(companyId)) return BadRequest(new { success = false, message = "CompanyId is required" });

            var result = await _manager.GetZonesAsync(companyId);
            return Ok(new { success = true, data = result });
        }
    }
}
