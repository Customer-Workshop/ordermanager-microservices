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
    public async Task GetAllInventory_ReturnsSeedItems()
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
    public async Task Deduct_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        var qtyBefore = item!.QuantityOnHand;

        var updated = await service.DeductAsync(1, 5);
        Assert.Equal(qtyBefore - 5, updated.QuantityOnHand);
    }

    [Fact]
    public async Task Deduct_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.DeductAsync(1, 99999));
    }

    [Fact]
    public async Task GetLowStock_ReturnsItemsBelowReorderLevel()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        // Deduct to make one item low-stock
        var item = await context.InventoryItems.FirstAsync(i => i.ProductId == 1);
        item.QuantityOnHand = 5;
        await context.SaveChangesAsync();

        var lowStock = await service.GetLowStockItemsAsync();
        Assert.Single(lowStock);
        Assert.Equal(1, lowStock[0].ProductId);
    }
}
