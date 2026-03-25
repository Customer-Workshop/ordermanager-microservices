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
            new InventoryItem { Id = 1, ProductId = 1, ProductName = "Widget A", Sku = "WGT-001", QuantityOnHand = 50, ReorderLevel = 10, WarehouseLocation = "A-01" },
            new InventoryItem { Id = 2, ProductId = 2, ProductName = "Widget B", Sku = "WGT-002", QuantityOnHand = 5, ReorderLevel = 10, WarehouseLocation = "A-02" }
        );
        context.SaveChanges();
        return context;
    }

    [Fact]
    public async Task GetAllInventory_ReturnsAllItems()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var items = await service.GetAllInventoryAsync();
        Assert.Equal(2, items.Count);
    }

    [Fact]
    public async Task GetInventoryByProductId_ReturnsItem()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(item);
        Assert.Equal("Widget A", item.ProductName);
    }

    [Fact]
    public async Task GetInventoryByProductId_ReturnsNull_WhenNotFound()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(999);
        Assert.Null(item);
    }

    [Fact]
    public async Task Restock_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.RestockAsync(1, 25);
        Assert.Equal(75, item.QuantityOnHand);
    }

    [Fact]
    public async Task Restock_ThrowsForUnknownProduct()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<ArgumentException>(() => service.RestockAsync(999, 10));
    }

    [Fact]
    public async Task GetLowStockItems_ReturnsItemsBelowReorderLevel()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var items = await service.GetLowStockItemsAsync();
        Assert.Single(items);
        Assert.Equal(2, items[0].ProductId);
    }

    [Fact]
    public async Task CheckStock_ReturnsTrueWhenSufficient()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var available = await service.CheckStockAsync(1, 30);
        Assert.True(available);
    }

    [Fact]
    public async Task CheckStock_ReturnsFalseWhenInsufficient()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var available = await service.CheckStockAsync(1, 100);
        Assert.False(available);
    }

    [Fact]
    public async Task DeductStock_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.DeductStockAsync(1, 10);
        Assert.NotNull(item);
        Assert.Equal(40, item.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ReturnsNull_WhenInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.DeductStockAsync(1, 100);
        Assert.Null(item);
    }
}
