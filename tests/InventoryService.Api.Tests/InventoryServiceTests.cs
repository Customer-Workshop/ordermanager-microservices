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

        var product = new Product { Id = 1, Name = "Test Widget", Sku = "TST-001", Price = 9.99m };
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
    public async Task GetAllInventory_ReturnsAllItems()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        var items = await service.GetAllInventoryAsync();

        Assert.Single(items);
        Assert.Equal("Test Widget", items[0].Product.Name);
    }

    [Fact]
    public async Task GetInventoryByProductId_ReturnsCorrectItem()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        var item = await service.GetInventoryByProductIdAsync(1);

        Assert.NotNull(item);
        Assert.Equal(100, item.QuantityOnHand);
    }

    [Fact]
    public async Task GetInventoryByProductId_ReturnsNullForMissing()
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

        var item = await service.RestockAsync(1, 50);

        Assert.Equal(150, item.QuantityOnHand);
    }

    [Fact]
    public async Task Restock_ThrowsForMissingProduct()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        await Assert.ThrowsAsync<ArgumentException>(() => service.RestockAsync(999, 50));
    }

    [Fact]
    public async Task DeductStock_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        var item = await service.DeductStockAsync(1, 30);

        Assert.Equal(70, item.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ThrowsForInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeductStockAsync(1, 200));
    }

    [Fact]
    public async Task GetLowStockItems_ReturnsItemsBelowReorderLevel()
    {
        using var context = CreateContext();
        // Add a low-stock item
        context.Products.Add(new Product { Id = 2, Name = "Low Stock Widget", Sku = "LOW-001", Price = 5.99m });
        context.InventoryItems.Add(new InventoryItem
        {
            Id = 2,
            ProductId = 2,
            QuantityOnHand = 5,
            ReorderLevel = 10,
            WarehouseLocation = "B-01"
        });
        context.SaveChanges();

        var service = new InventoryItemService(context);
        var items = await service.GetLowStockItemsAsync();

        Assert.Single(items);
        Assert.Equal("Low Stock Widget", items[0].Product.Name);
    }
}
