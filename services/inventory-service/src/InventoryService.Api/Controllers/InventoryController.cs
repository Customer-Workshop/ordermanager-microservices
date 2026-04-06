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
        try
        {
            var item = await _inventoryService.RestockAsync(productId, request.Quantity);
            return Ok(item);
        }
        catch (ArgumentException ex)
        {
            return ex.ParamName == "quantity"
                ? BadRequest(new { message = ex.Message })
                : NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock() => Ok(await _inventoryService.GetLowStockItemsAsync());

    [HttpPost("product/{productId}/deduct")]
    public async Task<IActionResult> DeductStock(int productId, [FromBody] DeductRequest request)
    {
        var success = await _inventoryService.DeductStockAsync(productId, request.Quantity);
        if (!success)
            return Conflict(new { message = $"Insufficient stock for product {productId}" });
        return Ok(new { message = "Stock deducted successfully" });
    }

    [HttpGet("product/{productId}/stock-level")]
    public async Task<IActionResult> GetStockLevel(int productId)
    {
        var level = await _inventoryService.GetStockLevelAsync(productId);
        return Ok(new { productId, quantityOnHand = level });
    }
}

public record DeductRequest(int Quantity);
