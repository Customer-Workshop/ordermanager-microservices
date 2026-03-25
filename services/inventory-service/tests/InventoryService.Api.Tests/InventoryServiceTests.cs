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
    public async Task GetAllInventory_ReturnsSeedData()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var items = await service.GetAllInventoryAsync();
        Assert.Equal(5, items.Count);
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
    public async Task GetLowStockItems_ReturnsItemsBelowReorderLevel()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        // All seed items have qty >= 50 and reorder level 10, so none should be low
        var lowStock = await service.GetLowStockItemsAsync();
        Assert.Empty(lowStock);

        // Deduct stock to make one item low
        await service.DeductStockAsync(1, 45);
        lowStock = await service.GetLowStockItemsAsync();
        Assert.Single(lowStock);
    }

    [Fact]
    public async Task DeductStock_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.DeductStockAsync(1, 10);
        Assert.NotNull(result);
        Assert.Equal(40, result.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ReturnsNull_WhenInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.DeductStockAsync(1, 99999);
        Assert.Null(result);
    }

    [Fact]
    public async Task GetStockLevel_ReturnsQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var level = await service.GetStockLevelAsync(1);
        Assert.Equal(50, level);
    }

    [Fact]
    public async Task GetStockLevel_ReturnsZero_WhenNotFound()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var level = await service.GetStockLevelAsync(999);
        Assert.Equal(0, level);
    }
}
