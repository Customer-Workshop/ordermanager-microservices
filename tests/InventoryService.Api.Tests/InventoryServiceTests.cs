using Microsoft.EntityFrameworkCore;
using InventoryService.Api.Data;
using InventoryService.Api.Models;
using InventoryService.Api.Services;
using Xunit;

namespace InventoryService.Api.Tests;

public class InventoryServiceTests
{
    private InventoryDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new InventoryDbContext(options);
        context.InventoryItems.Add(new InventoryItem
        {
            Id = 1, ProductId = 1, ProductName = "Widget A",
            QuantityOnHand = 100, ReorderLevel = 10, WarehouseLocation = "A-01"
        });
        context.InventoryItems.Add(new InventoryItem
        {
            Id = 2, ProductId = 2, ProductName = "Widget B",
            QuantityOnHand = 5, ReorderLevel = 10, WarehouseLocation = "A-02"
        });
        context.SaveChanges();
        return context;
    }

    [Fact]
    public async Task GetAllInventoryAsync_ReturnsAllItems()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var items = await service.GetAllInventoryAsync();
        Assert.Equal(2, items.Count);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsItem()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(item);
        Assert.Equal("Widget A", item.ProductName);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsNull_WhenNotFound()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(999);
        Assert.Null(item);
    }

    [Fact]
    public async Task RestockAsync_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.RestockAsync(1, 50);
        Assert.Equal(150, item.QuantityOnHand);
    }

    [Fact]
    public async Task DeductAsync_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.DeductAsync(1, 30);
        Assert.Equal(70, item.QuantityOnHand);
    }

    [Fact]
    public async Task DeductAsync_ThrowsWhenInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeductAsync(1, 999));
    }

    [Fact]
    public async Task GetLowStockItemsAsync_ReturnsLowStockOnly()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var items = await service.GetLowStockItemsAsync();
        Assert.Single(items);
        Assert.Equal(2, items[0].ProductId);
    }
}
