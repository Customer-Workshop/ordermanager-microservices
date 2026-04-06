using Microsoft.EntityFrameworkCore;
using InventoryService.Api.Data;
using InventoryService.Api.Models;
using InventoryService.Api.Services;
using Xunit;

namespace InventoryService.Api.Tests;

public class InventoryItemServiceTests
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
    public async Task GetAllInventoryAsync_ReturnsAllItems()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var items = await service.GetAllInventoryAsync();
        Assert.Equal(5, items.Count);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsCorrectItem()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var product = await context.Products.FirstAsync();
        var item = await service.GetInventoryByProductIdAsync(product.Id);
        Assert.NotNull(item);
        Assert.Equal(product.Id, item.ProductId);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsNull_WhenNotFound()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(9999);
        Assert.Null(item);
    }

    [Fact]
    public async Task RestockAsync_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var product = await context.Products.FirstAsync();
        var before = await service.GetInventoryByProductIdAsync(product.Id);
        var qtyBefore = before!.QuantityOnHand;

        var after = await service.RestockAsync(product.Id, 50);
        Assert.Equal(qtyBefore + 50, after.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStockAsync_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var product = await context.Products.FirstAsync();
        var before = await service.GetInventoryByProductIdAsync(product.Id);
        var qtyBefore = before!.QuantityOnHand;

        var after = await service.DeductStockAsync(product.Id, 10);
        Assert.Equal(qtyBefore - 10, after.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStockAsync_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var product = await context.Products.FirstAsync();

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.DeductStockAsync(product.Id, 99999));
    }

    [Fact]
    public async Task GetLowStockItemsAsync_ReturnsLowStockItems()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var lowStock = await service.GetLowStockItemsAsync();
        Assert.Contains(lowStock, i => i.QuantityOnHand <= i.ReorderLevel);
    }
}
