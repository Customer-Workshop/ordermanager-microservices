using Microsoft.AspNetCore.Mvc;
using InventoryService.Api.Services;

namespace InventoryService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly InventoryItemService _service;

    public InventoryController(InventoryItemService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllInventoryAsync());

    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetByProduct(int productId)
    {
        var item = await _service.GetInventoryByProductIdAsync(productId);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost("product/{productId}/restock")]
    public async Task<IActionResult> Restock(int productId, [FromBody] RestockRequest request)
    {
        var item = await _service.RestockAsync(productId, request.Quantity);
        return Ok(item);
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock() => Ok(await _service.GetLowStockItemsAsync());

    [HttpGet("product/{productId}/check")]
    public async Task<IActionResult> CheckStock(int productId, [FromQuery] int quantity)
    {
        var result = await _service.CheckStockAsync(productId, quantity);
        return Ok(result);
    }

    [HttpPost("product/{productId}/deduct")]
    public async Task<IActionResult> DeductStock(int productId, [FromBody] DeductRequest request)
    {
        var result = await _service.DeductStockAsync(productId, request.Quantity);
        return result is null ? BadRequest("Insufficient stock") : Ok(result);
    }
}

public record RestockRequest(int Quantity);
public record DeductRequest(int Quantity);
