using Microsoft.AspNetCore.Mvc;
using OrderService.Api.Services;

namespace OrderService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly OrderManager _orderManager;

    public OrdersController(OrderManager orderManager)
    {
        _orderManager = orderManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _orderManager.GetAllOrdersAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _orderManager.GetOrderByIdAsync(id);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
    {
        if (request.Items == null || request.Items.Count == 0)
            return BadRequest(new { error = "Order must contain at least one item" });

        var items = request.Items.Select(i => (i.ProductId, i.Quantity, i.UnitPrice)).ToList();
        var order = await _orderManager.CreateOrderAsync(request.CustomerId, items);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        var order = await _orderManager.UpdateOrderStatusAsync(id, request.Status);
        return order is null ? NotFound() : Ok(order);
    }
}

public record CreateOrderRequest(int CustomerId, List<OrderItemRequest> Items);
public record OrderItemRequest(int ProductId, int Quantity, decimal UnitPrice);
public record UpdateStatusRequest(string Status);
