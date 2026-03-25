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
    private readonly InventoryManagementService _inventoryService;

    public InventoryController(InventoryManagementService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    [SwaggerOperation(Summary = "Get all inventory items")]
    [ProducesResponseType(typeof(List<InventoryItem>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll() => Ok(await _inventoryService.GetAllInventoryAsync());

    [HttpGet("product/{productId}")]
    [SwaggerOperation(Summary = "Get inventory for a specific product")]
    [ProducesResponseType(typeof(InventoryItem), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByProduct(int productId)
    {
        var item = await _inventoryService.GetInventoryByProductIdAsync(productId);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost("product/{productId}/restock")]
    [SwaggerOperation(Summary = "Restock a product")]
    [ProducesResponseType(typeof(InventoryItem), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Restock(int productId, [FromBody] RestockRequest request)
    {
        var item = await _inventoryService.RestockAsync(productId, request.Quantity);
        return Ok(item);
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock() => Ok(await _inventoryService.GetLowStockItemsAsync());

    [HttpGet("product/{productId}/check")]
    public async Task<IActionResult> CheckStock(int productId, [FromQuery] int quantity = 1)
    {
        var available = await _inventoryService.CheckStockAsync(productId, quantity);
        return Ok(new { productId, quantity, available });
    }

    [HttpPost("product/{productId}/deduct")]
    public async Task<IActionResult> DeductStock(int productId, [FromBody] DeductStockRequest request)
    {
        try
        {
            var item = await _inventoryService.DeductStockAsync(productId, request.Quantity);
            return Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpGet("low-stock")]
    [SwaggerOperation(Summary = "Get items with stock at or below reorder level")]
    [ProducesResponseType(typeof(List<InventoryItem>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLowStock() => Ok(await _inventoryService.GetLowStockItemsAsync());

    [HttpGet("product/{productId}/check")]
    [SwaggerOperation(Summary = "Check if sufficient stock is available")]
    [ProducesResponseType(typeof(StockCheckResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckStock(int productId, [FromQuery] int quantity)
    {
        var available = await _inventoryService.CheckStockAsync(productId, quantity);
        return Ok(new StockCheckResponse(productId, quantity, available));
    }

    [HttpPost("product/{productId}/deduct")]
    [SwaggerOperation(Summary = "Deduct stock for a product (called by order service)")]
    [ProducesResponseType(typeof(InventoryItem), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeductStock(int productId, [FromBody] DeductRequest request)
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

public record RestockRequest(int Quantity);
public record DeductRequest(int Quantity);
public record StockCheckResponse(int ProductId, int Quantity, bool Available);
