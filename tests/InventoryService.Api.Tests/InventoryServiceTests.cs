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
    public async Task GetAllInventory_ReturnsSeedData()
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
        var product = await context.Products.FirstAsync();
        var item = await service.GetInventoryByProductIdAsync(product.Id);
        Assert.NotNull(item);
        Assert.Equal(product.Id, item.ProductId);
    }

    [Fact]
    public async Task GetInventoryByProductId_ReturnsNull_WhenNotFound()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.GetInventoryByProductIdAsync(9999);
        Assert.Null(item);
    }

    [Fact]
    public async Task Restock_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var product = await context.Products.FirstAsync();
        var before = await context.InventoryItems.FirstAsync(i => i.ProductId == product.Id);
        var qtyBefore = before.QuantityOnHand;

        var result = await service.RestockAsync(product.Id, 25);
        Assert.Equal(qtyBefore + 25, result.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var product = await context.Products.FirstAsync();
        var before = await context.InventoryItems.FirstAsync(i => i.ProductId == product.Id);
        var qtyBefore = before.QuantityOnHand;

        var result = await service.DeductStockAsync(product.Id, 5);
        Assert.Equal(qtyBefore - 5, result.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var product = await context.Products.FirstAsync();

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.DeductStockAsync(product.Id, 99999));
    }

    [Fact]
    public async Task GetLowStockItems_ReturnsCorrectItems()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);

        // Deplete first product to below reorder level
        var product = await context.Products.FirstAsync();
        var inv = await context.InventoryItems.FirstAsync(i => i.ProductId == product.Id);
        inv.QuantityOnHand = 5;
        await context.SaveChangesAsync();

        var lowStock = await service.GetLowStockItemsAsync();
        Assert.Contains(lowStock, i => i.ProductId == product.Id);
    }
}
