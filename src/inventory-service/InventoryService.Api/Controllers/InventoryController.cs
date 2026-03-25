using Microsoft.AspNetCore.Mvc;
using InventoryService.Api.DTOs;
using InventoryService.Api.Services;

namespace InventoryService.Api.Controllers;

/// <summary>
/// REST API controller for inventory management operations.
/// Provides endpoints for querying, restocking, and managing inventory items.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class InventoryController : ControllerBase
{
    private readonly InventoryBusinessService _inventoryService;

    public InventoryController(InventoryBusinessService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    /// <summary>Retrieves all inventory items.</summary>
    /// <returns>A list of all inventory items.</returns>
    /// <response code="200">Returns the list of inventory items.</response>
    [HttpGet]
    [ProducesResponseType(typeof(List<InventoryItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var items = await _inventoryService.GetAllInventoryAsync();
        return Ok(items);
    }

    /// <summary>Retrieves a single inventory item by ID.</summary>
    /// <param name="id">The inventory item ID.</param>
    /// <returns>The inventory item.</returns>
    /// <response code="200">Returns the inventory item.</response>
    /// <response code="404">Item not found.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(InventoryItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _inventoryService.GetInventoryByIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    /// <summary>Retrieves the inventory record for a specific product.</summary>
    /// <param name="productId">The product ID to look up.</param>
    /// <returns>The inventory item for the product.</returns>
    /// <response code="200">Returns the inventory item.</response>
    /// <response code="404">No inventory record for this product.</response>
    [HttpGet("product/{productId:int}")]
    [ProducesResponseType(typeof(InventoryItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByProduct(int productId)
    {
        var item = await _inventoryService.GetInventoryByProductIdAsync(productId);
        return item is null ? NotFound() : Ok(item);
    }

    /// <summary>Creates a new inventory record.</summary>
    /// <param name="request">The inventory item details.</param>
    /// <returns>The created inventory item.</returns>
    /// <response code="201">Inventory item created.</response>
    /// <response code="409">Inventory record already exists for this product.</response>
    [HttpPost]
    [ProducesResponseType(typeof(InventoryItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateInventoryItemRequest request)
    {
        try
        {
            var item = await _inventoryService.CreateInventoryItemAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>Restocks an inventory item by adding quantity.</summary>
    /// <param name="productId">The product ID to restock.</param>
    /// <param name="request">The restock quantity.</param>
    /// <returns>The updated inventory item.</returns>
    /// <response code="200">Item restocked successfully.</response>
    /// <response code="400">Invalid request (e.g., negative quantity).</response>
    /// <response code="404">No inventory record for this product.</response>
    [HttpPost("product/{productId:int}/restock")]
    [ProducesResponseType(typeof(InventoryItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
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

    /// <summary>Returns all items with stock at or below their reorder level.</summary>
    /// <returns>A list of low-stock inventory items.</returns>
    /// <response code="200">Returns the list of low-stock items.</response>
    [HttpGet("low-stock")]
    [ProducesResponseType(typeof(List<InventoryItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLowStock()
    {
        var items = await _inventoryService.GetLowStockItemsAsync();
        return Ok(items);
    }

    /// <summary>Checks stock availability for a product.</summary>
    /// <param name="productId">The product ID.</param>
    /// <param name="quantity">Required quantity (default: 1).</param>
    /// <returns>Stock availability information.</returns>
    /// <response code="200">Returns stock check result.</response>
    [HttpGet("product/{productId:int}/check")]
    [ProducesResponseType(typeof(StockCheckResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckStock(int productId, [FromQuery] int quantity = 1)
    {
        var result = await _inventoryService.CheckStockAsync(productId, quantity);
        return Ok(result);
    }

    /// <summary>Deducts stock from a product's inventory (used by Order service).</summary>
    /// <param name="productId">The product ID.</param>
    /// <param name="request">The quantity to deduct.</param>
    /// <returns>The updated inventory item.</returns>
    /// <response code="200">Stock deducted successfully.</response>
    /// <response code="400">Invalid request or insufficient stock.</response>
    /// <response code="404">No inventory record for this product.</response>
    [HttpPost("product/{productId:int}/deduct")]
    [ProducesResponseType(typeof(InventoryItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeductStock(int productId, [FromBody] DeductStockRequest request)
    {
        try
        {
            var item = await _inventoryService.DeductStockAsync(productId, request.Quantity);
            return Ok(item);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
