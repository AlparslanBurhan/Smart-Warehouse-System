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
    public class ProductController : ControllerBase
    {
        private readonly IProductManager _manager;

        public ProductController(IProductManager manager)
        {
            _manager = manager;
        }

        // KURAL: GET listeleme
        [HttpGet("list")]
        public async Task<IActionResult> GetProducts(
            [FromQuery] string companyId, 
            [FromQuery] string searchTerm = "", 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 25,
            [FromQuery] bool hasStock = false,
            [FromQuery] string zone = "")
        {
            if (string.IsNullOrWhiteSpace(companyId)) return BadRequest(new { success = false, message = "CompanyId is required" });

            var result = await _manager.GetProductsAsync(companyId, searchTerm, page, pageSize, hasStock, zone);
            return Ok(result);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
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

        // KURAL: Sadece POST
        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] ProductUpdateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CompanyId)) return BadRequest(new { success = false, message = "CompanyId is required" });

            try
            {
                var result = await _manager.UpdateAsync(dto);
                return Ok(new { success = true, data = result });
            }
            catch (KeyNotFoundException)
            {
                return StatusCode(403, new { success = false, message = "Access denied or product not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // KURAL: Sadece POST
        [HttpPost("delete")]
        public async Task<IActionResult> Delete([FromBody] DeleteDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CompanyId)) return BadRequest(new { success = false, message = "CompanyId is required" });

            try
            {
                await _manager.DeleteAsync(dto);
                return Ok(new { success = true, message = "Product deleted successfully" });
            }
            catch (KeyNotFoundException)
            {
                return StatusCode(403, new { success = false, message = "Access denied or product not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
