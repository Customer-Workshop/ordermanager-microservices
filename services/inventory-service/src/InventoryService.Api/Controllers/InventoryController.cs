using Microsoft.AspNetCore.Mvc;
using InventoryService.Api.Services;
using InventoryService.Api.Models;

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
        var item = await _inventoryService.RestockAsync(productId, request.Quantity);
        return Ok(item);
    }

    [HttpPost("product/{productId}/deduct")]
    public async Task<IActionResult> Deduct(int productId, [FromBody] DeductRequest request)
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
    public async Task<IActionResult> GetLowStock() => Ok(await _inventoryService.GetLowStockItemsAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInventoryRequest request)
    {
        var item = new InventoryItem
        {
            ProductId = request.ProductId,
            ProductName = request.ProductName,
            Sku = request.Sku,
            QuantityOnHand = request.QuantityOnHand,
            ReorderLevel = request.ReorderLevel,
            WarehouseLocation = request.WarehouseLocation
        };
        var created = await _inventoryService.CreateInventoryItemAsync(item);
        return CreatedAtAction(nameof(GetByProduct), new { productId = created.ProductId }, created);
    }
}

public record RestockRequest(int Quantity);
public record DeductRequest(int Quantity);
public record CreateInventoryRequest(
    int ProductId,
    string ProductName,
    string Sku,
    int QuantityOnHand,
    int ReorderLevel = 10,
    string WarehouseLocation = "");
