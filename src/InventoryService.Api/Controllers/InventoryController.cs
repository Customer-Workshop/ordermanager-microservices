using Microsoft.AspNetCore.Mvc;
using InventoryService.Api.Models;
using InventoryService.Api.Services;

namespace InventoryService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly InventoryItemService _service;

    public InventoryController(InventoryItemService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<InventoryItem>>> GetAll()
    {
        return await _service.GetAllInventoryAsync();
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<InventoryItem>> GetByProductId(int productId)
    {
        var item = await _service.GetInventoryByProductIdAsync(productId);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost("product/{productId}/restock")]
    public async Task<ActionResult<InventoryItem>> Restock(int productId, [FromBody] RestockRequest request)
    {
        try
        {
            var item = await _service.RestockAsync(productId, request.Quantity);
            return Ok(item);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("product/{productId}/deduct")]
    public async Task<ActionResult<InventoryItem>> Deduct(int productId, [FromBody] DeductRequest request)
    {
        try
        {
            var item = await _service.DeductStockAsync(productId, request.Quantity);
            return Ok(item);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<List<InventoryItem>>> GetLowStock()
    {
        return await _service.GetLowStockItemsAsync();
    }
}
