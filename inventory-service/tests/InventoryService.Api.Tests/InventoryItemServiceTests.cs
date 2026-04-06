using Microsoft.EntityFrameworkCore;
using Xunit;
using InventoryService.Api.Data;
using InventoryService.Api.Models;
using InventoryService.Api.Services;

namespace InventoryService.Api.Tests;

public class InventoryItemServiceTests
{
    private InventoryDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new InventoryDbContext(options);

        var product = new Product { Id = 1, Name = "Test Product", Sku = "TST-001", Price = 9.99m };
        context.Products.Add(product);
        context.InventoryItems.Add(new InventoryItem
        {
            Id = 1,
            ProductId = 1,
            QuantityOnHand = 100,
            ReorderLevel = 10,
            WarehouseLocation = "A-01"
        });
        context.SaveChanges();
        return context;
    }

    [Fact]
    public async Task GetAllInventoryAsync_ReturnsAllItems()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var items = await service.GetAllInventoryAsync();
        Assert.Single(items);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsItem()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(item);
        Assert.Equal(100, item.QuantityOnHand);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsNullForMissing()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(999);
        Assert.Null(item);
    }

    [Fact]
    public async Task RestockAsync_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.RestockAsync(1, 50);
        Assert.Equal(150, item.QuantityOnHand);
    }

    [Fact]
    public async Task CheckStockAsync_ReturnsTrueWhenSufficient()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var available = await service.CheckStockAsync(1, 50);
        Assert.True(available);
    }

    [Fact]
    public async Task CheckStockAsync_ReturnsFalseWhenInsufficient()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var available = await service.CheckStockAsync(1, 200);
        Assert.False(available);
    }

    [Fact]
    public async Task DeductStockAsync_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.DeductStockAsync(1, 30);
        Assert.Equal(70, item.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStockAsync_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeductStockAsync(1, 200));
    }

    [Fact]
    public async Task GetLowStockItemsAsync_ReturnsLowStockItems()
    {
        using var context = CreateContext();
        var item = await context.InventoryItems.FirstAsync();
        item.QuantityOnHand = 5;
        await context.SaveChangesAsync();

        var service = new InventoryItemService(context);
        var lowStock = await service.GetLowStockItemsAsync();
        Assert.Single(lowStock);
    }
}
