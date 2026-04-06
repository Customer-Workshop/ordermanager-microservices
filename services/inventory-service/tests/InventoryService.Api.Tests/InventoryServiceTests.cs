using Xunit;
using Microsoft.EntityFrameworkCore;
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

        var product = new Product { Id = 1, Name = "Test Product", Sku = "TST-001", Price = 9.99m };
        context.Products.Add(product);
        context.InventoryItems.Add(new InventoryItem
        {
            Id = 1, ProductId = 1, QuantityOnHand = 100, ReorderLevel = 10, WarehouseLocation = "A1"
        });

        var lowStockProduct = new Product { Id = 2, Name = "Low Stock Item", Sku = "TST-002", Price = 19.99m };
        context.Products.Add(lowStockProduct);
        context.InventoryItems.Add(new InventoryItem
        {
            Id = 2, ProductId = 2, QuantityOnHand = 5, ReorderLevel = 10, WarehouseLocation = "B1"
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
        Assert.Equal(2, items.Count);
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
    public async Task GetInventoryByProductIdAsync_ReturnsNull_WhenNotFound()
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
    public async Task RestockAsync_ThrowsWhenProductNotFound()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<ArgumentException>(() => service.RestockAsync(999, 10));
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
    public async Task DeductStockAsync_ThrowsWhenInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeductStockAsync(1, 200));
    }

    [Fact]
    public async Task GetLowStockItemsAsync_ReturnsLowStockOnly()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var items = await service.GetLowStockItemsAsync();
        Assert.Single(items);
        Assert.Equal("Low Stock Item", items[0].Product.Name);
    }
}
