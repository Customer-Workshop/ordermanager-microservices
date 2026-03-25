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
    public async Task<IActionResult> Restock(int productId, [FromBody] RestockRequest request)
    {
        var item = await _inventoryManager.RestockAsync(productId, request.Quantity);
        return Ok(item);
    }

    [HttpPost("product/{productId}/reserve")]
    public async Task<IActionResult> Reserve(int productId, [FromBody] ReserveRequest request)
    {
        var success = await _inventoryManager.ReserveStockAsync(productId, request.Quantity);
        return success ? Ok(new { reserved = true }) : BadRequest(new { reserved = false, message = "Insufficient stock" });
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock() => Ok(await _inventoryManager.GetLowStockItemsAsync());
}

public record RestockRequest(int Quantity);
public record ReserveRequest(int Quantity);
