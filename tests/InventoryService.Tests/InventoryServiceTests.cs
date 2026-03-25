using Microsoft.EntityFrameworkCore;
using Xunit;
using InventoryService.Data;
using InventoryService.Models;
using InventoryService.Services;

namespace InventoryService.Tests;

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
        var service = new InventoryManagementService(context);
        var items = await service.GetAllInventoryAsync();
        Assert.Equal(5, items.Count);
    }

    [Fact]
    public async Task GetInventoryByProductId_ReturnsCorrectItem()
    {
        using var context = CreateContext();
        var service = new InventoryManagementService(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(item);
        Assert.Equal("Widget A", item.ProductName);
    }

    [Fact]
    public async Task GetInventoryByProductId_ReturnsNull_WhenNotFound()
    {
        using var context = CreateContext();
        var service = new InventoryManagementService(context);
        var item = await service.GetInventoryByProductIdAsync(999);
        Assert.Null(item);
    }

    [Fact]
    public async Task Restock_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryManagementService(context);
        var before = await service.GetInventoryByProductIdAsync(1);
        var qtyBefore = before!.QuantityOnHand;

        var result = await service.RestockAsync(1, 25);
        Assert.Equal(qtyBefore + 25, result.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryManagementService(context);
        var before = await service.GetInventoryByProductIdAsync(1);
        var qtyBefore = before!.QuantityOnHand;

        var result = await service.DeductStockAsync(1, 10);
        Assert.Equal(qtyBefore - 10, result.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryManagementService(context);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.DeductStockAsync(1, 99999));
    }

    [Fact]
    public async Task GetLowStockItems_ReturnsEmptyWhenAllStocked()
    {
        using var context = CreateContext();
        var service = new InventoryManagementService(context);
        var items = await service.GetLowStockItemsAsync();
        Assert.Empty(items);
    }

    [Fact]
    public async Task GetLowStockItems_DetectsLowStock()
    {
        using var context = CreateContext();
        var service = new InventoryManagementService(context);

        // Deduct stock to trigger low-stock
        var item = await context.InventoryItems.FirstAsync(i => i.ProductId == 1);
        item.QuantityOnHand = 5;
        await context.SaveChangesAsync();

        var lowStock = await service.GetLowStockItemsAsync();
        Assert.Single(lowStock);
        Assert.Equal(1, lowStock[0].ProductId);
    }
}
