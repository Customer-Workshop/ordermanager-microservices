using Microsoft.EntityFrameworkCore;
using Xunit;
using InventoryService.Api.Data;
using InventoryService.Api.Models;
using InventoryService.Api.Services;

namespace InventoryService.Api.Tests;

public class InventoryServiceTests
{
    private static InventoryDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new InventoryDbContext(options);

        context.InventoryItems.AddRange(
            new InventoryItem { Id = 1, ProductId = 1, ProductName = "Widget A", QuantityOnHand = 50, ReorderLevel = 10, WarehouseLocation = "A-01" },
            new InventoryItem { Id = 2, ProductId = 2, ProductName = "Widget B", QuantityOnHand = 5, ReorderLevel = 10, WarehouseLocation = "A-02" },
            new InventoryItem { Id = 3, ProductId = 3, ProductName = "Gadget X", QuantityOnHand = 0, ReorderLevel = 10, WarehouseLocation = "A-03" }
        );
        context.SaveChanges();

        return context;
    }

    [Fact]
    public async Task GetAllInventoryAsync_ReturnsAllItems()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryItemService(context);

        var result = await service.GetAllInventoryAsync();

        Assert.Equal(3, result.Count);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsCorrectItem()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryItemService(context);

        var result = await service.GetInventoryByProductIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("Widget A", result.ProductName);
        Assert.Equal(50, result.QuantityOnHand);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsNull_WhenNotFound()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryItemService(context);

        var result = await service.GetInventoryByProductIdAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task RestockAsync_IncreasesQuantity()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryItemService(context);

        var result = await service.RestockAsync(1, 25);

        Assert.Equal(75, result.QuantityOnHand);
    }

    [Fact]
    public async Task RestockAsync_ThrowsForInvalidProduct()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryItemService(context);

        await Assert.ThrowsAsync<ArgumentException>(() => service.RestockAsync(999, 10));
    }

    [Fact]
    public async Task RestockAsync_ThrowsForZeroQuantity()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryItemService(context);

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => service.RestockAsync(1, 0));
    }

    [Fact]
    public async Task GetLowStockItemsAsync_ReturnsOnlyLowStockItems()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryItemService(context);

        var result = await service.GetLowStockItemsAsync();

        Assert.Equal(2, result.Count);
        Assert.All(result, item => Assert.True(item.QuantityOnHand <= item.ReorderLevel));
    }

    [Fact]
    public async Task ReserveStockAsync_DecreasesQuantity()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryItemService(context);

        var success = await service.ReserveStockAsync(1, 10);

        Assert.True(success);
        var item = await context.InventoryItems.FirstAsync(i => i.ProductId == 1);
        Assert.Equal(40, item.QuantityOnHand);
    }

    [Fact]
    public async Task ReserveStockAsync_ReturnsFalse_WhenInsufficientStock()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryItemService(context);

        var success = await service.ReserveStockAsync(3, 10);

        Assert.False(success);
    }
}
