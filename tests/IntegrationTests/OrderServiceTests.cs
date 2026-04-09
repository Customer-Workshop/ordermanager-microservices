using System.Net;
using System.Net.Http.Json;
using IntegrationTests.Factories;
using Microsoft.Extensions.DependencyInjection;
using OrderService.Data;
using OrderService.Models;

namespace IntegrationTests;

public class OrderServiceTests : IClassFixture<OrderServiceFactory>
{
    private readonly HttpClient _client;
    private readonly OrderServiceFactory _factory;

    public OrderServiceTests(OrderServiceFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private async Task SeedOrderAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
        if (!db.Orders.Any())
        {
            var order = new Order
            {
                CustomerId = 1,
                Status = "Pending",
                TotalAmount = 99.99m,
                ShippingAddress = "123 Test St, Testville, TX 75001",
                Items = new List<OrderItem>
                {
                    new() { ProductId = 1, Quantity = 2, UnitPrice = 49.995m }
                }
            };
            db.Orders.Add(order);
            await db.SaveChangesAsync();
        }
    }

    [Fact]
    public async Task GetAllOrders_ReturnsOk()
    {
        await SeedOrderAsync();

        var response = await _client.GetAsync("/api/orders");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var orders = await response.Content.ReadFromJsonAsync<List<OrderResponse>>();
        Assert.NotNull(orders);
        Assert.True(orders.Count >= 1);
    }

    [Fact]
    public async Task GetOrderById_ExistingId_ReturnsOk()
    {
        await SeedOrderAsync();

        var response = await _client.GetAsync("/api/orders/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var order = await response.Content.ReadFromJsonAsync<OrderResponse>();
        Assert.NotNull(order);
        Assert.Equal(1, order.Id);
    }

    [Fact]
    public async Task GetOrderById_NonExistentId_ReturnsNotFound()
    {
        var response = await _client.GetAsync("/api/orders/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateOrderStatus_ExistingOrder_ReturnsOk()
    {
        await SeedOrderAsync();

        var payload = new { Status = "Shipped" };
        var response = await _client.PatchAsJsonAsync("/api/orders/1/status", payload);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<OrderResponse>();
        Assert.NotNull(updated);
        Assert.Equal("Shipped", updated.Status);
    }

    [Fact]
    public async Task HealthEndpoint_ReturnsHealthy()
    {
        var response = await _client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Healthy", body);
    }
}

public class OrderResponse
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public List<OrderItemResponse> Items { get; set; } = new();
}

public class OrderItemResponse
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
