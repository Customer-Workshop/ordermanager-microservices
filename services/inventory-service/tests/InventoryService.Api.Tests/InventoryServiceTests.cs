using Microsoft.EntityFrameworkCore;
using Xunit;
using InventoryService.Api.Data;
using InventoryService.Api.Models;
using InventoryService.Api.Services;

namespace InventoryService.Api.Tests;

public class InventoryServiceTests
{
    private InventoryDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new InventoryDbContext(options);
        SeedData.Initialize(context);
        return context;
    }

    [Fact]
    public async Task GetAllInventory_ReturnsAllItems()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var items = await service.GetAllInventoryAsync();
        Assert.Equal(5, items.Count);
    }

    [Fact]
    public async Task GetInventoryByProductId_ReturnsCorrectItem()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(item);
        Assert.Equal("Widget A", item.ProductName);
    }

    [Fact]
    public async Task RestockAsync_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var before = await service.GetInventoryByProductIdAsync(1);
        var qtyBefore = before!.QuantityOnHand;
        var item = await service.RestockAsync(1, 25);
        Assert.NotNull(item);
        Assert.Equal(qtyBefore + 25, item.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStockAsync_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var before = await service.GetInventoryByProductIdAsync(1);
        var qtyBefore = before!.QuantityOnHand;
        var item = await service.DeductStockAsync(1, 10);
        Assert.NotNull(item);
        Assert.Equal(qtyBefore - 10, item.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStockAsync_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.DeductStockAsync(1, 99999));
    }

    [Fact]
    public async Task GetLowStockItems_ReturnsItemsBelowReorderLevel()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var items = await service.GetLowStockItemsAsync();
        Assert.True(items.Count > 0);
        Assert.All(items, i => Assert.True(i.QuantityOnHand <= i.ReorderLevel));
    }
}
