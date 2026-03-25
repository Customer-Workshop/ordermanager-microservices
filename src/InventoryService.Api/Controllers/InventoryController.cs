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

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock() => Ok(await _inventoryService.GetLowStockItemsAsync());

    [HttpPost("product/{productId}/decrement")]
    public async Task<IActionResult> Decrement(int productId, [FromBody] DecrementRequest request)
    {
        try
        {
            var item = await _inventoryService.DeductStockAsync(productId, request.Quantity);
            return item is null ? NotFound() : Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPost("product/{productId}/deduct")]
    public async Task<IActionResult> Deduct(int productId, [FromBody] DeductRequest request)
    {
        try
        {
            var item = await _inventoryService.DeductStockAsync(productId, request.Quantity);
            return item is null ? NotFound() : Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>Deduct stock for a product (used by monolith Order service).</summary>
    /// <param name="productId">The product ID to deduct stock from.</param>
    /// <param name="request">The deduct request containing the quantity to remove.</param>
    /// <returns>The updated inventory item after deduction.</returns>
    /// <response code="200">Stock successfully deducted. Returns the updated inventory item.</response>
    /// <response code="404">No inventory record found for the given product ID.</response>
    /// <response code="409">Insufficient stock to fulfill the deduction.</response>
    [HttpPost("product/{productId}/decrement")]
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

/// <summary>Request body for stock deduction operations.</summary>
/// <param name="Quantity">The quantity to deduct from stock.</param>
public record DeductRequest(int Quantity);
