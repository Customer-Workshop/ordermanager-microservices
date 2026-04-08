using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using InventoryService.Api.Data;
using InventoryService.Api.Models;
using Xunit;

namespace InventoryService.Api.Tests;

public class InventoryContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public InventoryContractTests(WebApplicationFactory<Program> factory)
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
                    d => d.ServiceType == typeof(DbContextOptions<InventoryDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                var dbName = "TestInventory_" + Guid.NewGuid();
                services.AddDbContext<InventoryDbContext>(options =>
                    options.UseInMemoryDatabase(dbName));

                var sp = services.BuildServiceProvider();
                using var scope = sp.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
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
                    d => d.ServiceType == typeof(DbContextOptions<InventoryDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                var dbName = "TestInventoryEmpty_" + Guid.NewGuid();
                services.AddDbContext<InventoryDbContext>(options =>
                    options.UseInMemoryDatabase(dbName));
            });
        });

        var client = factory.CreateClient();

        // Clear seeded data so the database is empty for this test
        using var scope = factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
        context.InventoryItems.RemoveRange(context.InventoryItems);
        context.SaveChanges();

        return client;
    }

    // ===== GET /api/inventory =====

    [Fact]
    public async Task GetAll_ReturnsOk_WithSeededItems()
    {
        var client = CreateSeededClient();

        var response = await client.GetAsync("/api/inventory");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var items = await response.Content.ReadFromJsonAsync<List<InventoryItem>>();
        Assert.NotNull(items);
        Assert.Equal(5, items.Count);
    }

    [Fact]
    public async Task GetAll_ReturnsOk_EmptyList_WhenNoItems()
    {
        var client = CreateEmptyClient();

        var response = await client.GetAsync("/api/inventory");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var items = await response.Content.ReadFromJsonAsync<List<InventoryItem>>();
        Assert.NotNull(items);
        Assert.Empty(items);
    }

    // ===== GET /api/inventory/product/{productId} =====

    [Fact]
    public async Task GetByProduct_ReturnsOk_WhenItemExists()
    {
        var client = CreateSeededClient();

        var response = await client.GetAsync("/api/inventory/product/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var item = await response.Content.ReadFromJsonAsync<InventoryItem>();
        Assert.NotNull(item);
        Assert.Equal(1, item.ProductId);
        Assert.True(item.QuantityOnHand > 0);
    }

    [Fact]
    public async Task GetByProduct_ReturnsNotFound_WhenItemDoesNotExist()
    {
        var client = CreateSeededClient();

        var response = await client.GetAsync("/api/inventory/product/9999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ===== POST /api/inventory/product/{productId}/restock =====

    [Fact]
    public async Task Restock_ReturnsOk_WithUpdatedQuantity()
    {
        var client = CreateSeededClient();
        var request = new { Quantity = 25 };

        var response = await client.PostAsJsonAsync("/api/inventory/product/1/restock", request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var item = await response.Content.ReadFromJsonAsync<InventoryItem>();
        Assert.NotNull(item);
        Assert.Equal(1, item.ProductId);
        // Seed data has ProductId=1 with QuantityOnHand=50, after restock should be 75
        Assert.Equal(75, item.QuantityOnHand);
    }

    [Fact]
    public async Task Restock_ReturnsNotFound_WhenProductDoesNotExist()
    {
        var client = CreateSeededClient();
        var request = new { Quantity = 10 };

        var response = await client.PostAsJsonAsync("/api/inventory/product/9999/restock", request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ===== GET /api/inventory/low-stock =====

    [Fact]
    public async Task GetLowStock_ReturnsOk_WithEmptyList_WhenAllStocked()
    {
        var client = CreateSeededClient();

        var response = await client.GetAsync("/api/inventory/low-stock");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var items = await response.Content.ReadFromJsonAsync<List<InventoryItem>>();
        Assert.NotNull(items);
        // All seeded items have QuantityOnHand > ReorderLevel (10), so none are low-stock
        Assert.Empty(items);
    }

    [Fact]
    public async Task GetLowStock_ReturnsOk_EmptyList_WhenNoItems()
    {
        var client = CreateEmptyClient();

        var response = await client.GetAsync("/api/inventory/low-stock");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var items = await response.Content.ReadFromJsonAsync<List<InventoryItem>>();
        Assert.NotNull(items);
        Assert.Empty(items);
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
