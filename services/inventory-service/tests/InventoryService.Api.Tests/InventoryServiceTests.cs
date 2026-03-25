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
    public async Task GetAllInventory_ReturnsSeededItems()
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
        var item = await service.GetInventoryByProductIdAsync(1);
        var qtyBefore = item!.QuantityOnHand;

        var result = await service.RestockAsync(1, 25);
        Assert.Equal(qtyBefore + 25, result.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        var qtyBefore = item!.QuantityOnHand;

        var result = await service.DeductStockAsync(1, 10);
        Assert.Equal(qtyBefore - 10, result.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.DeductStockAsync(1, 99999));
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
    public async Task GetLowStockItems_ReturnsItems_WhenBelowReorderLevel()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        // Deduct stock to bring below reorder level
        await service.DeductStockAsync(1, 45);

        var lowStock = await service.GetLowStockItemsAsync();
        Assert.Single(lowStock);
        Assert.Equal(1, lowStock[0].ProductId);
    }
}
