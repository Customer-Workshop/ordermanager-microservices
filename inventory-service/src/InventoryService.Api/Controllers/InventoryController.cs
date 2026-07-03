using Microsoft.AspNetCore.Mvc;
using InventoryService.Api.Services;

namespace InventoryService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly InventoryManager _inventoryManager;

    public InventoryController(InventoryManager inventoryManager)
    {
        _inventoryManager = inventoryManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _inventoryManager.GetAllInventoryAsync());

    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetByProduct(int productId)
    {
        var item = await _inventoryManager.GetInventoryByProductIdAsync(productId);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost("product/{productId}/restock")]
    public async Task<IActionResult> Restock(int productId, [FromBody] QuantityRequest request)
    {
        try
        {
            return Ok(await _inventoryManager.RestockAsync(productId, request.Quantity));
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPost("product/{productId}/deduct")]
    public async Task<IActionResult> Deduct(int productId, [FromBody] QuantityRequest request)
    {
        try
        {
            return Ok(await _inventoryManager.DeductAsync(productId, request.Quantity));
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
    public async Task<IActionResult> GetLowStock() => Ok(await _inventoryManager.GetLowStockItemsAsync());
}

public record QuantityRequest(int Quantity);
