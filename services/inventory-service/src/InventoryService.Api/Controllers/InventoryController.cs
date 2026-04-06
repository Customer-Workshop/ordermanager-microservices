using Microsoft.AspNetCore.Mvc;
using InventoryService.Api.Services;

namespace InventoryService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly InventoryItemService _inventoryService;

    public InventoryController(InventoryItemService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _inventoryService.GetAllInventoryAsync();
        return Ok(items);
    }

    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetByProductId(int productId)
    {
        var item = await _inventoryService.GetInventoryByProductIdAsync(productId);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost("product/{productId}/restock")]
    public async Task<IActionResult> Restock(int productId, [FromBody] QuantityRequest request)
    {
        try
        {
            var item = await _inventoryService.RestockAsync(productId, request.Quantity);
            return Ok(item);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPost("product/{productId}/deduct")]
    public async Task<IActionResult> DeductStock(int productId, [FromBody] QuantityRequest request)
    {
        try
        {
            var item = await _inventoryService.DeductStockAsync(productId, request.Quantity);
            return Ok(item);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock()
    {
        var items = await _inventoryService.GetLowStockItemsAsync();
        return Ok(items);
    }

    [HttpGet("product/{productId}/check-stock")]
    public async Task<IActionResult> CheckStock(int productId, [FromQuery] int quantity = 1)
    {
        var available = await _inventoryService.CheckStockAsync(productId, quantity);
        return Ok(new { productId, quantity, available });
    }
}

public class QuantityRequest
{
    public int Quantity { get; set; }
}
