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
    public class CompanyController : ControllerBase
    {
        private readonly ICompanyManager _manager;

        public CompanyController(ICompanyManager manager)
        {
            _manager = manager;
        }

        // KURAL 11: Server-side pagination and search
        [HttpGet]
        public async Task<IActionResult> GetList([FromQuery] string searchTerm = "", [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var result = await _manager.GetCompaniesAsync(searchTerm, page, pageSize);
            return Ok(result);
        }

        // KURAL 6: Sadece POST
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CompanyCreateDto dto)
        {
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
        public async Task<IActionResult> Update([FromBody] CompanyUpdateDto dto)
        {
            try
            {
                var result = await _manager.UpdateAsync(dto);
                return Ok(new { success = true, data = result });
            }
            catch (KeyNotFoundException)
            {
                return StatusCode(403, new { success = false, message = "Access denied or company not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("delete")]
        public async Task<IActionResult> Delete([FromBody] Guid id)
        {
            try
            {
                await _manager.DeleteAsync(id);
                return Ok(new { success = true, message = "Company soft-deleted successfully" });
            }
            catch (KeyNotFoundException)
            {
                return StatusCode(403, new { success = false, message = "Access denied or company not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
