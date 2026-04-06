using Microsoft.AspNetCore.Mvc;
using InventoryService.Api.Models;
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
    public async Task<ActionResult<List<InventoryItem>>> GetAll()
    {
        return Ok(await _inventoryService.GetAllInventoryAsync());
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<InventoryItem>> GetByProduct(int productId)
    {
        var item = await _inventoryService.GetInventoryByProductIdAsync(productId);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost("product/{productId}/restock")]
    public async Task<ActionResult<InventoryItem>> Restock(int productId, [FromBody] RestockRequest request)
    {
        try
        {
            var item = await _inventoryService.RestockAsync(productId, request.Quantity);
            return Ok(item);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("product/{productId}/deduct")]
    public async Task<IActionResult> Deduct(int productId, [FromBody] DeductRequest request)
    {
        try
        {
            var item = await _inventoryService.DeductAsync(productId, request.Quantity);
            return Ok(item);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<List<InventoryItem>>> GetLowStock()
    {
        return Ok(await _inventoryService.GetLowStockItemsAsync());
    }

    [HttpGet("product/{productId}/check")]
    public async Task<ActionResult> CheckStock(int productId, [FromQuery] int quantity = 1)
    {
        var item = await _inventoryService.GetInventoryByProductIdAsync(productId);
        if (item is null) return NotFound(new { available = false, message = $"No inventory for product {productId}" });
        return Ok(new { available = item.QuantityOnHand >= quantity, quantityOnHand = item.QuantityOnHand });
    }
}

public record RestockRequest(int Quantity);
public record DeductRequest(int Quantity);
