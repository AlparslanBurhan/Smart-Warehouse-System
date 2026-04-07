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
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionManager _manager;

        public TransactionController(ITransactionManager manager)
        {
            _manager = manager;
        }

        [HttpPost("input")]
        public async Task<IActionResult> ProcessInput([FromBody] TransactionRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CompanyId)) return BadRequest(new { success = false, message = "CompanyId is required" });

            try
            {
                await _manager.ProcessInputAsync(dto);
                return Ok(new { success = true, message = "Input processed successfully" });
            }
            catch (KeyNotFoundException)
            {
                return StatusCode(403, new { success = false, message = "Access denied or entity not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("output")]
        public async Task<IActionResult> ProcessOutput([FromBody] TransactionRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CompanyId)) return BadRequest(new { success = false, message = "CompanyId is required" });

            try
            {
                await _manager.ProcessOutputAsync(dto);
                return Ok(new { success = true, message = "Output processed successfully" });
            }
            catch (KeyNotFoundException)
            {
                return StatusCode(403, new { success = false, message = "Access denied or entity not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
        [HttpPost("transfer")]
        public async Task<IActionResult> ProcessTransfer([FromBody] TransactionTransferDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CompanyId)) return BadRequest(new { success = false, message = "CompanyId is required" });

            try
            {
                await _manager.ProcessTransferAsync(dto);
                return Ok(new { success = true, message = "Transfer processed successfully" });
            }
            catch (KeyNotFoundException)
            {
                return StatusCode(403, new { success = false, message = "Access denied or entity not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs([FromQuery] string companyId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50, [FromQuery] string transactionType = "")
        {
            if (string.IsNullOrWhiteSpace(companyId)) return BadRequest(new { success = false, message = "CompanyId is required" });

            var result = await _manager.GetLogsAsync(companyId, page, pageSize, transactionType);
            return Ok(result);
        }
    }
}
