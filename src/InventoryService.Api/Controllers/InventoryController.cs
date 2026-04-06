using Microsoft.AspNetCore.Mvc;
using InventoryService.Api.Models;
using InventoryService.Api.Services;

namespace InventoryService.Api.Controllers;

/// <summary>
/// Manages inventory stock levels, restocking operations, and low-stock alerts.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class InventoryController : ControllerBase
{
    private readonly InventoryItemService _inventoryService;

    public InventoryController(InventoryItemService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    /// <summary>Get all inventory items.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<InventoryItem>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll() => Ok(await _inventoryService.GetAllInventoryAsync());

    /// <summary>Get inventory for a specific product.</summary>
    [HttpGet("product/{productId}")]
    [ProducesResponseType(typeof(InventoryItem), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByProduct(int productId)
    {
        var item = await _inventoryService.GetInventoryByProductIdAsync(productId);
        return item is null ? NotFound() : Ok(item);
    }

    /// <summary>Restock a product by adding quantity.</summary>
    [HttpPost("product/{productId}/restock")]
    [ProducesResponseType(typeof(InventoryItem), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Restock(int productId, [FromBody] RestockRequest request)
    {
        try
        {
            var item = await _inventoryService.RestockAsync(productId, request.Quantity);
            return Ok(item);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>Get all items at or below reorder level.</summary>
    [HttpGet("low-stock")]
    [ProducesResponseType(typeof(List<InventoryItem>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLowStock() => Ok(await _inventoryService.GetLowStockItemsAsync());

    /// <summary>Reserve stock for an order (used by Order service).</summary>
    [HttpPost("product/{productId}/reserve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> ReserveStock(int productId, [FromBody] RestockRequest request)
    {
        var success = await _inventoryService.ReserveStockAsync(productId, request.Quantity);
        if (!success)
            return Conflict(new { error = $"Insufficient stock for product {productId}" });

        return Ok(new { reserved = true, productId, quantity = request.Quantity });
    }

    /// <summary>Deduct stock for a product and return the updated item (used by monolith OrderService).</summary>
    [HttpPost("product/{productId}/deduct")]
    [ProducesResponseType(typeof(InventoryItem), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DecrementStock(int productId, [FromBody] DeductRequest request)
    {
        try
        {
            var item = await _inventoryService.DeductStockAsync(productId, request.Quantity);
            if (item is null)
                return NotFound(new { error = $"No inventory record for product {productId}" });
            return Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }
}

/// <summary>Request body for restock operations.</summary>
public record RestockRequest(int Quantity);

/// <summary>Request body for stock deduction operations.</summary>
public record DeductRequest(int Quantity);
