using Microsoft.EntityFrameworkCore;
using InventoryService.Api.Data;
using InventoryService.Api.Models;
using InventoryService.Api.Services;
using Xunit;

namespace InventoryService.Api.Tests;

public class InventoryItemServiceTests
{
    private static InventoryDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        var context = new InventoryDbContext(options);

        context.Products.AddRange(
            new Product { Id = 1, Name = "Widget A", Sku = "WGT-001" },
            new Product { Id = 2, Name = "Widget B", Sku = "WGT-002" }
        );
        context.InventoryItems.AddRange(
            new InventoryItem { Id = 1, ProductId = 1, QuantityOnHand = 100, ReorderLevel = 10, WarehouseLocation = "A-1" },
            new InventoryItem { Id = 2, ProductId = 2, QuantityOnHand = 5, ReorderLevel = 10, WarehouseLocation = "A-2" }
        );
        context.SaveChanges();
        return context;
    }

    [Fact]
    public async Task GetAllInventory_ReturnsSeedData()
    {
        using var context = CreateContext(nameof(GetAllInventory_ReturnsSeedData));
        var service = new InventoryItemService(context);
        var items = await service.GetAllInventoryAsync();
        Assert.Equal(2, items.Count);
    }

    [Fact]
    public async Task GetInventoryByProductId_ReturnsItem()
    {
        using var context = CreateContext(nameof(GetInventoryByProductId_ReturnsItem));
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(item);
        Assert.Equal(100, item.QuantityOnHand);
    }

    [Fact]
    public async Task GetInventoryByProductId_ReturnsNull_WhenNotFound()
    {
        using var context = CreateContext(nameof(GetInventoryByProductId_ReturnsNull_WhenNotFound));
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(999);
        Assert.Null(item);
    }

    [Fact]
    public async Task Restock_IncreasesQuantity()
    {
        using var context = CreateContext(nameof(Restock_IncreasesQuantity));
        var service = new InventoryItemService(context);
        var item = await service.RestockAsync(1, 50);
        Assert.Equal(150, item.QuantityOnHand);
    }

    [Fact]
    public async Task Restock_ThrowsOnNonPositiveQuantity()
    {
        using var context = CreateContext(nameof(Restock_ThrowsOnNonPositiveQuantity));
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<ArgumentException>(() => service.RestockAsync(1, 0));
    }

    [Fact]
    public async Task DeductStock_DecreasesQuantity()
    {
        using var context = CreateContext(nameof(DeductStock_DecreasesQuantity));
        var service = new InventoryItemService(context);
        var item = await service.DeductStockAsync(1, 30);
        Assert.Equal(70, item.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext(nameof(DeductStock_ThrowsOnInsufficientStock));
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeductStockAsync(2, 50));
    }

    [Fact]
    public async Task DeductStock_ThrowsOnNonPositiveQuantity()
    {
        using var context = CreateContext(nameof(DeductStock_ThrowsOnNonPositiveQuantity));
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<ArgumentException>(() => service.DeductStockAsync(1, -1));
    }

    [Fact]
    public async Task GetLowStockItems_ReturnsLowStockOnly()
    {
        using var context = CreateContext(nameof(GetLowStockItems_ReturnsLowStockOnly));
        var service = new InventoryItemService(context);
        var items = await service.GetLowStockItemsAsync();
        Assert.Single(items);
        Assert.Equal(2, items[0].ProductId);
    }
}
