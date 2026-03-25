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
    public async Task<IActionResult> GetAll() => Ok(await _inventoryService.GetAllInventoryAsync());

    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetByProduct(int productId)
    {
        var item = await _inventoryService.GetInventoryByProductIdAsync(productId);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost("product/{productId}/restock")]
    public async Task<IActionResult> Restock(int productId, [FromBody] RestockRequest request)
    {
        var item = await _inventoryService.RestockAsync(productId, request.Quantity);
        return Ok(item);
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock() => Ok(await _inventoryService.GetLowStockItemsAsync());

    [HttpGet("product/{productId}/check")]
    public async Task<IActionResult> CheckStock(int productId, [FromQuery] int quantity)
    {
        var item = await _inventoryService.CheckStockAsync(productId, quantity);
        if (item is null) return NotFound();
        return Ok(new { item.ProductId, item.QuantityOnHand, Sufficient = item.QuantityOnHand >= quantity });
    }

    [HttpPost("product/{productId}/decrement")]
    public async Task<IActionResult> DecrementStock(int productId, [FromBody] DecrementRequest request)
    {
        try
        {
            var item = await _inventoryService.DecrementStockAsync(productId, request.Quantity);
            return Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }
}

public record RestockRequest(int Quantity);
public record DecrementRequest(int Quantity);
