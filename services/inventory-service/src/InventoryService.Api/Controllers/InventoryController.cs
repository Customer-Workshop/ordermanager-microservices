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
        var items = await _service.GetAllInventoryAsync();
        return Ok(items);
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<InventoryItem>> GetByProduct(int productId)
    {
        var item = await _service.GetInventoryByProductIdAsync(productId);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost("product/{productId}/restock")]
    public async Task<ActionResult<InventoryItem>> Restock(int productId, [FromBody] RestockRequest request)
    {
        var item = await _service.RestockAsync(productId, request.Quantity);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost("product/{productId}/deduct")]
    public async Task<ActionResult<InventoryItem>> DeductStock(int productId, [FromBody] DeductStockRequest request)
    {
        try
        {
            var item = await _service.DeductStockAsync(productId, request.Quantity);
            if (item == null) return NotFound();
            return Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<List<InventoryItem>>> GetLowStock()
    {
        var items = await _service.GetLowStockItemsAsync();
        return Ok(items);
    }

    [HttpGet("product/{productId}/check")]
    public async Task<ActionResult<object>> CheckStock(int productId, [FromQuery] int quantity = 1)
    {
        var available = await _service.CheckStockAsync(productId, quantity);
        return Ok(new { productId, quantity, available });
    }
}
