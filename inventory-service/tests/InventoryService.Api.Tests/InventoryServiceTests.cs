using Microsoft.EntityFrameworkCore;
using InventoryService.Api.Data;
using InventoryService.Api.Models;
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
        SeedData.Initialize(context);
        return context;
    }

    [Fact]
    public async Task GetAllInventory_ReturnsSeededItems()
    {
        using var context = CreateContext();
        var service = new Services.InventoryManager(context);
        var items = await service.GetAllInventoryAsync();
        Assert.Equal(5, items.Count);
    }

    [Fact]
    public async Task GetByProductId_ReturnsCorrectItem()
    {
        using var context = CreateContext();
        var service = new Services.InventoryManager(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(item);
        Assert.Equal("Widget A", item.ProductName);
        Assert.Equal(50, item.QuantityOnHand);
    }

    [Fact]
    public async Task GetByProductId_ReturnsNull_WhenNotFound()
    {
        using var context = CreateContext();
        var service = new Services.InventoryManager(context);
        var item = await service.GetInventoryByProductIdAsync(999);
        Assert.Null(item);
    }

    [Fact]
    public async Task Restock_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new Services.InventoryManager(context);
        var item = await service.RestockAsync(1, 25);
        Assert.Equal(75, item.QuantityOnHand);
    }

    [Fact]
    public async Task Restock_ThrowsOnInvalidProduct()
    {
        using var context = CreateContext();
        var service = new Services.InventoryManager(context);
        await Assert.ThrowsAsync<ArgumentException>(() => service.RestockAsync(999, 25));
    }

    [Fact]
    public async Task CheckStock_ReturnsTrueWhenSufficient()
    {
        using var context = CreateContext();
        var service = new Services.InventoryManager(context);
        var available = await service.CheckStockAsync(1, 10);
        Assert.True(available);
    }

    [Fact]
    public async Task CheckStock_ReturnsFalseWhenInsufficient()
    {
        using var context = CreateContext();
        var service = new Services.InventoryManager(context);
        var available = await service.CheckStockAsync(1, 999);
        Assert.False(available);
    }

    [Fact]
    public async Task CheckStock_ReturnsFalseForNonexistentProduct()
    {
        using var context = CreateContext();
        var service = new Services.InventoryManager(context);
        var available = await service.CheckStockAsync(999, 1);
        Assert.False(available);
    }

    [Fact]
    public async Task DeductStock_ReducesQuantity()
    {
        using var context = CreateContext();
        var service = new Services.InventoryManager(context);
        var item = await service.DeductStockAsync(1, 10);
        Assert.Equal(40, item.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var service = new Services.InventoryManager(context);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeductStockAsync(1, 999));
    }

    [Fact]
    public async Task DeductStock_ThrowsOnInvalidProduct()
    {
        using var context = CreateContext();
        var service = new Services.InventoryManager(context);
        await Assert.ThrowsAsync<ArgumentException>(() => service.DeductStockAsync(999, 1));
    }

    [Fact]
    public async Task GetLowStock_FiltersCorrectly()
    {
        using var context = CreateContext();
        var service = new Services.InventoryManager(context);

        // Deplete product 1 to below reorder level
        await service.DeductStockAsync(1, 45);

        var lowStock = await service.GetLowStockItemsAsync();
        Assert.Single(lowStock);
        Assert.Equal(1, lowStock[0].ProductId);
    }
}
