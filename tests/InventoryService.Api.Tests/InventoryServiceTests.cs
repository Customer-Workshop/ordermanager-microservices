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
        context.InventoryItems.Add(new InventoryItem
        {
            ProductId = 1,
            ProductName = "Widget A",
            Sku = "WGT-001",
            QuantityOnHand = 50,
            ReorderLevel = 10,
            WarehouseLocation = "A-01"
        });
        context.InventoryItems.Add(new InventoryItem
        {
            ProductId = 2,
            ProductName = "Widget B",
            Sku = "WGT-002",
            QuantityOnHand = 5,
            ReorderLevel = 10,
            WarehouseLocation = "A-02"
        });
        context.SaveChanges();
        return context;
    }

    [Fact]
    public async Task GetAllInventory_ReturnsAllItems()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        var result = await service.GetAllInventoryAsync();

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetByProductId_ReturnsCorrectItem()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        var result = await service.GetInventoryByProductIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("Widget A", result.ProductName);
        Assert.Equal(50, result.QuantityOnHand);
    }

    [Fact]
    public async Task GetByProductId_ReturnsNullForMissing()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        var result = await service.GetInventoryByProductIdAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task Restock_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        var result = await service.RestockAsync(1, 25);

        Assert.Equal(75, result.QuantityOnHand);
    }

    [Fact]
    public async Task Restock_ThrowsForMissingProduct()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        await Assert.ThrowsAsync<ArgumentException>(() => service.RestockAsync(999, 10));
    }

    [Fact]
    public async Task DeductStock_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        var result = await service.DeductStockAsync(1, 10);

        Assert.Equal(40, result.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ThrowsForInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeductStockAsync(1, 999));
    }

    [Fact]
    public async Task GetLowStock_ReturnsOnlyLowStockItems()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        var result = await service.GetLowStockItemsAsync();

        Assert.Single(result);
        Assert.Equal("Widget B", result[0].ProductName);
    }
}
