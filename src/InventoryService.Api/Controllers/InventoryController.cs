using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using InventoryService.Api.Models;
using InventoryService.Api.Services;

namespace InventoryService.Api.Controllers;

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
    [SwaggerOperation(Summary = "Get all inventory items", Description = "Returns a list of all inventory items sorted by product name.")]
    [SwaggerResponse(200, "List of inventory items", typeof(List<InventoryItem>))]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _inventoryService.GetAllInventoryAsync());
    }

    /// <summary>Get inventory item by ID.</summary>
    [HttpGet("{id:int}")]
    [SwaggerOperation(Summary = "Get inventory item by ID")]
    [SwaggerResponse(200, "The inventory item", typeof(InventoryItem))]
    [SwaggerResponse(404, "Item not found")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _inventoryService.GetInventoryByIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    /// <summary>Get inventory by product ID.</summary>
    [HttpGet("product/{productId:int}")]
    [SwaggerOperation(Summary = "Get inventory by product ID", Description = "Looks up the inventory record for a specific product.")]
    [SwaggerResponse(200, "The inventory item for the product", typeof(InventoryItem))]
    [SwaggerResponse(404, "No inventory record for this product")]
    public async Task<IActionResult> GetByProduct(int productId)
    {
        var item = await _inventoryService.GetInventoryByProductIdAsync(productId);
        return item is null ? NotFound() : Ok(item);
    }

    /// <summary>Create a new inventory item.</summary>
    [HttpPost]
    [SwaggerOperation(Summary = "Create a new inventory item")]
    [SwaggerResponse(201, "The created inventory item", typeof(InventoryItem))]
    [SwaggerResponse(409, "Inventory record already exists for this product")]
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

    /// <summary>Update an existing inventory item.</summary>
    [HttpPatch("{id:int}")]
    [SwaggerOperation(Summary = "Update an existing inventory item", Description = "Partially updates an inventory item. Only provided fields are updated.")]
    [SwaggerResponse(200, "The updated inventory item", typeof(InventoryItem))]
    [SwaggerResponse(404, "Item not found")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateInventoryItemRequest request)
    {
        try
        {
            var item = await _inventoryService.UpdateInventoryItemAsync(id, request);
            return Ok(item);
        }
        catch (ArgumentException)
        {
            return NotFound();
        }
    }

    /// <summary>Delete an inventory item.</summary>
    [HttpDelete("{id:int}")]
    [SwaggerOperation(Summary = "Delete an inventory item")]
    [SwaggerResponse(204, "Item deleted")]
    [SwaggerResponse(404, "Item not found")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _inventoryService.DeleteInventoryItemAsync(id);
            return NoContent();
        }
        catch (ArgumentException)
        {
            return NotFound();
        }
    }

    /// <summary>Restock a product.</summary>
    [HttpPost("product/{productId:int}/restock")]
    [SwaggerOperation(Summary = "Restock a product", Description = "Adds the specified quantity to the product's on-hand inventory.")]
    [SwaggerResponse(200, "The updated inventory item", typeof(InventoryItem))]
    [SwaggerResponse(400, "Invalid quantity")]
    [SwaggerResponse(404, "No inventory record for this product")]
    public async Task<IActionResult> Restock(int productId, [FromBody] RestockRequest request)
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

    /// <summary>Get items that are at or below their reorder level.</summary>
    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock() => Ok(await _inventoryService.GetLowStockItemsAsync());

    [HttpGet("product/{productId}/check")]
    public async Task<IActionResult> CheckStock(int productId, [FromQuery] int quantity = 1)
    {
        return Ok(await _inventoryService.GetLowStockItemsAsync());
    }

    [HttpPost("product/{productId}/deduct")]
    public async Task<IActionResult> Deduct(int productId, [FromBody] DeductStockRequest request)
    {
        var item = await _inventoryService.DeductStockAsync(productId, request.Quantity);
        if (item is null) return BadRequest(new { message = $"Insufficient stock for product {productId}" });
        return Ok(item);
    }
}

public record RestockRequest(int Quantity);
public record DeductStockRequest(int Quantity);
