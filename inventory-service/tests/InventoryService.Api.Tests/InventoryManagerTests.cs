using Microsoft.EntityFrameworkCore;
using Xunit;
using InventoryService.Api.Data;
using InventoryService.Api.Services;

namespace InventoryService.Api.Tests;

public class InventoryManagerTests
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
    public async Task GetAllInventory_ReturnsSeededItems()
    {
        using var context = CreateContext();
        var manager = new InventoryManager(context);
        var items = await manager.GetAllInventoryAsync();
        Assert.Equal(5, items.Count);
    }

    [Fact]
    public async Task GetInventoryByProductId_ReturnsItem()
    {
        using var context = CreateContext();
        var manager = new InventoryManager(context);
        var item = await manager.GetInventoryByProductIdAsync(1);
        Assert.NotNull(item);
        Assert.Equal(1, item!.ProductId);
    }

    [Fact]
    public async Task GetInventoryByProductId_ReturnsNull_WhenMissing()
    {
        using var context = CreateContext();
        var manager = new InventoryManager(context);
        var item = await manager.GetInventoryByProductIdAsync(999);
        Assert.Null(item);
    }

    [Fact]
    public async Task Restock_IncreasesQuantity()
    {
        using var context = CreateContext();
        var manager = new InventoryManager(context);
        var before = (await manager.GetInventoryByProductIdAsync(1))!.QuantityOnHand;
        var item = await manager.RestockAsync(1, 25);
        Assert.Equal(before + 25, item.QuantityOnHand);
    }

    [Fact]
    public async Task Deduct_DecreasesQuantity()
    {
        using var context = CreateContext();
        var manager = new InventoryManager(context);
        var before = (await manager.GetInventoryByProductIdAsync(1))!.QuantityOnHand;
        var item = await manager.DeductAsync(1, 5);
        Assert.Equal(before - 5, item.QuantityOnHand);
    }

    [Fact]
    public async Task Deduct_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var manager = new InventoryManager(context);
        await Assert.ThrowsAsync<InvalidOperationException>(() => manager.DeductAsync(1, 99999));
    }

    [Fact]
    public async Task GetLowStockItems_ReturnsItemsAtOrBelowReorderLevel()
    {
        using var context = CreateContext();
        var manager = new InventoryManager(context);
        var item = await manager.GetInventoryByProductIdAsync(1);
        await manager.DeductAsync(1, item!.QuantityOnHand - item.ReorderLevel);
        var lowStock = await manager.GetLowStockItemsAsync();
        Assert.Contains(lowStock, i => i.ProductId == 1);
    }
}
