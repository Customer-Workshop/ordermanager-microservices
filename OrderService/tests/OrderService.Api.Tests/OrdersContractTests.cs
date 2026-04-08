using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using OrderService.Api.Data;
using OrderService.Api.Models;
using Xunit;

namespace OrderService.Api.Tests;

public class OrdersContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public OrdersContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    private HttpClient CreateSeededClient()
    {
        var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<OrderDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                var dbName = "TestOrders_" + Guid.NewGuid();
                services.AddDbContext<OrderDbContext>(options =>
                    options.UseInMemoryDatabase(dbName));

                var sp = services.BuildServiceProvider();
                using var scope = sp.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
                context.Database.EnsureCreated();
                SeedData.Initialize(context);
            });
        }).CreateClient();
        return client;
    }

    private HttpClient CreateEmptyClient()
    {
        var factory = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<OrderDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                var dbName = "TestOrdersEmpty_" + Guid.NewGuid();
                services.AddDbContext<OrderDbContext>(options =>
                    options.UseInMemoryDatabase(dbName));
            });
        });

        var client = factory.CreateClient();

        using var scope = factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
        context.Orders.RemoveRange(context.Orders);
        context.OrderItems.RemoveRange(context.OrderItems);
        context.SaveChanges();

        return client;
    }

    // ===== GET /api/orders =====

    [Fact]
    public async Task GetAll_ReturnsOk_WithSeededOrders()
    {
        var client = CreateSeededClient();

        var response = await client.GetAsync("/api/orders");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var orders = await response.Content.ReadFromJsonAsync<List<OrderDto>>();
        Assert.NotNull(orders);
        Assert.Equal(2, orders.Count);
    }

    [Fact]
    public async Task GetAll_ReturnsOk_EmptyList_WhenNoOrders()
    {
        var client = CreateEmptyClient();

        var response = await client.GetAsync("/api/orders");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var orders = await response.Content.ReadFromJsonAsync<List<OrderDto>>();
        Assert.NotNull(orders);
        Assert.Empty(orders);
    }

    [Fact]
    public async Task GetAll_ReturnsOrdersInDescendingDateOrder()
    {
        var client = CreateSeededClient();

        var response = await client.GetAsync("/api/orders");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var orders = await response.Content.ReadFromJsonAsync<List<OrderDto>>();
        Assert.NotNull(orders);
        Assert.True(orders.Count >= 2);
        Assert.True(orders[0].OrderDate >= orders[1].OrderDate);
    }

    // ===== GET /api/orders/{id} =====

    [Fact]
    public async Task GetById_ReturnsOk_WhenOrderExists()
    {
        var client = CreateSeededClient();

        var response = await client.GetAsync("/api/orders/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var order = await response.Content.ReadFromJsonAsync<OrderDto>();
        Assert.NotNull(order);
        Assert.Equal(1, order.Id);
        Assert.True(order.TotalAmount > 0);
        Assert.NotNull(order.Items);
        Assert.NotEmpty(order.Items);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenOrderDoesNotExist()
    {
        var client = CreateSeededClient();

        var response = await client.GetAsync("/api/orders/9999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetById_IncludesOrderItems()
    {
        var client = CreateSeededClient();

        var response = await client.GetAsync("/api/orders/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var order = await response.Content.ReadFromJsonAsync<OrderDto>();
        Assert.NotNull(order);
        Assert.NotNull(order.Items);
        Assert.True(order.Items.Count >= 1);
        var firstItem = order.Items[0];
        Assert.True(firstItem.ProductId > 0);
        Assert.True(firstItem.Quantity > 0);
        Assert.True(firstItem.UnitPrice > 0);
    }

    // ===== POST /api/orders =====

    [Fact]
    public async Task Create_ReturnsCreated_WithValidRequest()
    {
        var client = CreateSeededClient();
        var request = new
        {
            CustomerId = 1,
            Items = new[]
            {
                new { ProductId = 1, Quantity = 3, UnitPrice = 9.99m }
            }
        };

        var response = await client.PostAsJsonAsync("/api/orders", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var order = await response.Content.ReadFromJsonAsync<OrderDto>();
        Assert.NotNull(order);
        Assert.True(order.Id > 0);
        Assert.Equal(1, order.CustomerId);
        Assert.Equal("Pending", order.Status);
        Assert.Equal(29.97m, order.TotalAmount);
        Assert.NotNull(order.Items);
        Assert.Single(order.Items);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenNoItems()
    {
        var client = CreateSeededClient();
        var request = new
        {
            CustomerId = 1,
            Items = Array.Empty<object>()
        };

        var response = await client.PostAsJsonAsync("/api/orders", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_CalculatesTotalAmountCorrectly()
    {
        var client = CreateSeededClient();
        var request = new
        {
            CustomerId = 2,
            Items = new[]
            {
                new { ProductId = 1, Quantity = 2, UnitPrice = 10.00m },
                new { ProductId = 2, Quantity = 1, UnitPrice = 25.00m }
            }
        };

        var response = await client.PostAsJsonAsync("/api/orders", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var order = await response.Content.ReadFromJsonAsync<OrderDto>();
        Assert.NotNull(order);
        Assert.Equal(45.00m, order.TotalAmount);
        Assert.Equal(2, order.Items.Count);
    }

    // ===== PUT /api/orders/{id}/status =====

    [Fact]
    public async Task UpdateStatus_ReturnsOk_WithUpdatedOrder()
    {
        var client = CreateSeededClient();
        var request = new { Status = "Delivered" };

        var response = await client.PutAsJsonAsync("/api/orders/1/status", request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var order = await response.Content.ReadFromJsonAsync<OrderDto>();
        Assert.NotNull(order);
        Assert.Equal(1, order.Id);
        Assert.Equal("Delivered", order.Status);
    }

    [Fact]
    public async Task UpdateStatus_ReturnsNotFound_WhenOrderDoesNotExist()
    {
        var client = CreateSeededClient();
        var request = new { Status = "Shipped" };

        var response = await client.PutAsJsonAsync("/api/orders/9999/status", request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ===== GET /health =====

    [Fact]
    public async Task Health_ReturnsOk_WithHealthyStatus()
    {
        var client = CreateSeededClient();

        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Healthy", content);
    }
}

internal class OrderDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public List<OrderItemDto> Items { get; set; } = new();
}

internal class OrderItemDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}
