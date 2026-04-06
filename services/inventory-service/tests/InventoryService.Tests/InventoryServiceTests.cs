using Microsoft.EntityFrameworkCore;
using Xunit;
using InventoryService.Data;
using InventoryService.Models;
using InventoryService.Services;

namespace InventoryService.Tests;

public class InventoryServiceTests
{
    private static InventoryDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new InventoryDbContext(options);
        SeedData.Initialize(context);
        return context;
    }

    [Fact]
    public async Task GetAllInventory_ReturnsAllItems()
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
        var product = context.Products.First();
        var item = await service.GetInventoryByProductIdAsync(product.Id);
        Assert.NotNull(item);
        Assert.Equal(product.Id, item.ProductId);
    }

    [Fact]
    public async Task Restock_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var product = context.Products.First();
        var before = (await service.GetInventoryByProductIdAsync(product.Id))!.QuantityOnHand;
        var result = await service.RestockAsync(product.Id, 25);
        Assert.Equal(before + 25, result.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var product = context.Products.First();
        var before = (await service.GetInventoryByProductIdAsync(product.Id))!.QuantityOnHand;
        var result = await service.DeductStockAsync(product.Id, 10);
        Assert.Equal(before - 10, result.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var product = context.Products.First();
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.DeductStockAsync(product.Id, 99999));
    }

    [Fact]
    public async Task GetLowStockItems_ReturnsCorrectItems()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var items = await service.GetLowStockItemsAsync();
        Assert.All(items, i => Assert.True(i.QuantityOnHand <= i.ReorderLevel));
    }
}
