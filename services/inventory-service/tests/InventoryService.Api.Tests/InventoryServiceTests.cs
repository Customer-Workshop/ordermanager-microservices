using Microsoft.EntityFrameworkCore;
using Xunit;
using InventoryService.Api.Data;
using InventoryService.Api.Models;
using InventoryService.Api.Services;

namespace InventoryService.Api.Tests;

public class InventoryServiceTests
{
    private static InventoryDbContext CreateContext()
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
    public async Task GetAllInventoryAsync_ReturnsAllItems()
    {
        using var context = CreateContext();
        var service = new InventoryManagementService(context);

        var result = await service.GetAllInventoryAsync();

        Assert.Single(result);
        Assert.Equal("Test Widget", result[0].Product.Name);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsCorrectItem()
    {
        using var context = CreateContext();
        var service = new InventoryManagementService(context);

        var result = await service.GetInventoryByProductIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal(100, result.QuantityOnHand);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsNullForMissing()
    {
        using var context = CreateContext();
        var service = new InventoryManagementService(context);

        var result = await service.GetInventoryByProductIdAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task RestockAsync_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryManagementService(context);

        var result = await service.RestockAsync(1, 50);

        Assert.Equal(150, result.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStockAsync_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryManagementService(context);

        var result = await service.DeductStockAsync(1, 30);

        Assert.Equal(70, result.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStockAsync_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryManagementService(context);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.DeductStockAsync(1, 200));
    }

    [Fact]
    public async Task CheckStockAsync_ReturnsTrueWhenSufficient()
    {
        using var context = CreateContext();
        var service = new InventoryManagementService(context);

        var result = await service.CheckStockAsync(1, 50);

        Assert.True(result);
    }

    [Fact]
    public async Task CheckStockAsync_ReturnsFalseWhenInsufficient()
    {
        using var context = CreateContext();
        var service = new InventoryManagementService(context);

        var result = await service.CheckStockAsync(1, 200);

        Assert.False(result);
    }

    [Fact]
    public async Task GetLowStockItemsAsync_ReturnsLowStockItems()
    {
        using var context = CreateContext();
        var item = await context.InventoryItems.FirstAsync();
        item.QuantityOnHand = 5;
        await context.SaveChangesAsync();

        var service = new InventoryManagementService(context);
        var result = await service.GetLowStockItemsAsync();

        Assert.Single(result);
        Assert.Equal(5, result[0].QuantityOnHand);
    }
}
