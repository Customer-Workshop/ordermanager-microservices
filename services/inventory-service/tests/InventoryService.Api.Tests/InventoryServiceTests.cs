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
    public async Task GetByProductId_ReturnsNull_WhenNotFound()
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
        var before = await service.GetInventoryByProductIdAsync(1);
        var qtyBefore = before!.QuantityOnHand;

        var after = await service.RestockAsync(1, 25);
        Assert.Equal(qtyBefore + 25, after.QuantityOnHand);
    }

    [Fact]
    public async Task Restock_ThrowsForUnknownProduct()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<ArgumentException>(() => service.RestockAsync(999, 10));
    }

    [Fact]
    public async Task GetLowStock_ReturnsItemsBelowReorderLevel()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        // Set one item to low stock
        var item = await context.InventoryItems.FirstAsync(i => i.ProductId == 1);
        item.QuantityOnHand = 5;
        await context.SaveChangesAsync();

        var lowStock = await service.GetLowStockItemsAsync();
        Assert.Single(lowStock);
        Assert.Equal(1, lowStock[0].ProductId);
    }

    [Fact]
    public async Task DeductStock_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var before = await service.GetInventoryByProductIdAsync(1);
        var qtyBefore = before!.QuantityOnHand;

        var after = await service.DeductStockAsync(1, 10);
        Assert.NotNull(after);
        Assert.Equal(qtyBefore - 10, after.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeductStockAsync(1, 99999));
    }

    [Fact]
    public async Task DeductStock_ReturnsNull_WhenNotFound()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.DeductStockAsync(999, 10);
        Assert.Null(result);
    }
}
