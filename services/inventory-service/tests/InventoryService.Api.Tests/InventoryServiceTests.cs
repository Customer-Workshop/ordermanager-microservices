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
        SeedData.Initialize(context);
        return context;
    }

    [Fact]
    public async Task GetAllInventory_ReturnsSeedData()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var items = await service.GetAllInventoryAsync();
        Assert.Equal(5, items.Count);
    }

    [Fact]
    public async Task GetByProductId_ReturnsCorrectItem()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(item);
        Assert.Equal("Widget A", item.ProductName);
    }

    [Fact]
    public async Task Restock_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        var qtyBefore = item!.QuantityOnHand;

        var updated = await service.RestockAsync(1, 25);
        Assert.Equal(qtyBefore + 25, updated.QuantityOnHand);
    }

    [Fact]
    public async Task GetLowStock_ReturnsOnlyLowItems()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var lowItems = await service.GetLowStockItemsAsync();
        Assert.All(lowItems, i => Assert.True(i.QuantityOnHand <= i.ReorderLevel));
    }

    [Fact]
    public async Task CheckStock_ReturnsTrueWhenAvailable()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var available = await service.CheckStockAsync(1, 10);
        Assert.True(available);
    }

    [Fact]
    public async Task CheckStock_ReturnsFalseWhenInsufficient()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var available = await service.CheckStockAsync(1, 99999);
        Assert.False(available);
    }

    [Fact]
    public async Task DeductStock_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        var qtyBefore = item!.QuantityOnHand;

        var updated = await service.DeductStockAsync(1, 5);
        Assert.Equal(qtyBefore - 5, updated.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.DeductStockAsync(1, 99999));
    }
}
