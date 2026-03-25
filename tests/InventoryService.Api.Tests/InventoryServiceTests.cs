using Microsoft.EntityFrameworkCore;
using Xunit;
using InventoryService.Api.Data;
using InventoryService.Api.Models;
using InventoryService.Api.Services;

namespace InventoryService.Api.Tests;

public class InventoryServiceTests
{
    private static InventoryDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new InventoryDbContext(options);
        context.InventoryItems.AddRange(
            new InventoryItem { Id = 1, ProductId = 1, ProductName = "Widget A", QuantityOnHand = 50, ReorderLevel = 10, WarehouseLocation = "A-01" },
            new InventoryItem { Id = 2, ProductId = 2, ProductName = "Widget B", QuantityOnHand = 5, ReorderLevel = 10, WarehouseLocation = "A-02" }
        );
        context.SaveChanges();
        return context;
    }

    [Fact]
    public async Task GetAllInventoryAsync_ReturnsAllItems()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.GetAllInventoryAsync();
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsCorrectItem()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(result);
        Assert.Equal("Widget A", result.ProductName);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsNullForMissing()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.GetInventoryByProductIdAsync(999);
        Assert.Null(result);
    }

    [Fact]
    public async Task RestockAsync_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.RestockAsync(1, 25);
        Assert.Equal(75, result.QuantityOnHand);
    }

    [Fact]
    public async Task ReserveStockAsync_DecreasesQuantityOnSuccess()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var success = await service.ReserveStockAsync(1, 10);
        Assert.True(success);
        var item = await service.GetInventoryByProductIdAsync(1);
        Assert.Equal(40, item!.QuantityOnHand);
    }

    [Fact]
    public async Task ReserveStockAsync_ReturnsFalseWhenInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var success = await service.ReserveStockAsync(1, 999);
        Assert.False(success);
    }

    [Fact]
    public async Task GetLowStockItemsAsync_ReturnsLowStockOnly()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.GetLowStockItemsAsync();
        Assert.Single(result);
        Assert.Equal("Widget B", result[0].ProductName);
    }
}
