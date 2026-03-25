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
    public async Task GetInventoryByProductId_ReturnsCorrectItem()
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
    public async Task Restock_ThrowsForInvalidProduct()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<ArgumentException>(() => service.RestockAsync(999, 10));
    }

    [Fact]
    public async Task GetLowStockItems_ReturnsEmpty_WhenAllStocked()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var lowStock = await service.GetLowStockItemsAsync();
        Assert.Empty(lowStock);
    }

    [Fact]
    public async Task CheckAndDeductStock_DeductsCorrectly()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.CheckAndDeductStockAsync(1, 5);
        Assert.True(result);

        var item = await service.GetInventoryByProductIdAsync(1);
        Assert.Equal(45, item!.QuantityOnHand);
    }

    [Fact]
    public async Task CheckAndDeductStock_ReturnsFalse_WhenInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.CheckAndDeductStockAsync(1, 99999);
        Assert.False(result);
    }
}
