using Microsoft.AspNetCore.Mvc;
using InventoryService.Api.Models;
using InventoryService.Api.Services;

namespace InventoryService.Api.Controllers;

/// <summary>
/// Manages inventory items including stock levels, restocking, deductions, and low-stock alerts.
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

    /// <summary>Retrieves all inventory items.</summary>
    /// <response code="200">Returns the full list of inventory items.</response>
    [HttpGet]
    [ProducesResponseType(typeof(List<InventoryItem>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll() => Ok(await _inventoryService.GetAllInventoryAsync());

    /// <summary>Retrieves the inventory record for a specific product.</summary>
    /// <param name="productId">The product identifier.</param>
    /// <response code="200">Returns the inventory item.</response>
    /// <response code="404">No inventory record for the given product.</response>
    [HttpGet("product/{productId}")]
    [ProducesResponseType(typeof(InventoryItem), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByProduct(int productId)
    {
        var item = await _inventoryService.GetInventoryByProductIdAsync(productId);
        return item is null ? NotFound() : Ok(item);
    }

    /// <summary>Restocks an inventory item by adding the specified quantity.</summary>
    /// <param name="productId">The product identifier to restock.</param>
    /// <param name="request">The restock payload containing the quantity to add.</param>
    /// <response code="200">Returns the updated inventory item.</response>
    /// <response code="400">No inventory record for the given product.</response>
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

    /// <summary>Retrieves all inventory items at or below their reorder level.</summary>
    /// <response code="200">Returns the list of low-stock items.</response>
    [HttpGet("low-stock")]
    [ProducesResponseType(typeof(List<InventoryItem>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLowStock() => Ok(await _inventoryService.GetLowStockItemsAsync());

    /// <summary>Deducts stock from an inventory item (called by the Order service during checkout).</summary>
    /// <param name="productId">The product identifier.</param>
    /// <param name="request">The deduction payload containing the quantity to remove.</param>
    /// <response code="200">Stock deducted successfully.</response>
    /// <response code="409">Insufficient stock to fulfill the deduction.</response>
    [HttpPost("product/{productId}/deduct")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeductStock(int productId, [FromBody] DeductRequest request)
    {
        var success = await _inventoryService.CheckAndDeductStockAsync(productId, request.Quantity);
        if (!success)
            return Conflict(new { message = $"Insufficient stock for product {productId}" });
        return Ok(new { message = "Stock deducted successfully" });
    }
}

/// <summary>Request body for restocking an inventory item.</summary>
/// <param name="Quantity">The quantity to add to the current stock.</param>
public record RestockRequest(int Quantity);

/// <summary>Request body for deducting stock from an inventory item.</summary>
/// <param name="Quantity">The quantity to deduct from the current stock.</param>
public record DeductRequest(int Quantity);
