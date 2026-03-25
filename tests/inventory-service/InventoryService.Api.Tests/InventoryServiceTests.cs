using Microsoft.EntityFrameworkCore;
using Xunit;
using InventoryService.Api.Data;
using InventoryService.Api.DTOs;
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
    public async Task GetAllInventory_ReturnsFiveItems()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var items = await service.GetAllInventoryAsync();
        Assert.Equal(5, items.Count);
    }

    [Fact]
    public async Task GetInventoryByProductId_ReturnsCorrectItem()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(item);
        Assert.Equal("Widget A", item.ProductName);
        Assert.Equal("WGT-001", item.Sku);
        Assert.Equal(50, item.QuantityOnHand);
    }

    [Fact]
    public async Task GetInventoryByProductId_ReturnsNull_WhenNotFound()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var item = await service.GetInventoryByProductIdAsync(999);
        Assert.Null(item);
    }

    [Fact]
    public async Task Restock_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var result = await service.RestockAsync(1, 25);
        Assert.Equal(75, result.QuantityOnHand);
    }

    [Fact]
    public async Task Restock_ThrowsOnZeroQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        await Assert.ThrowsAsync<ArgumentException>(() => service.RestockAsync(1, 0));
    }

    [Fact]
    public async Task Restock_ThrowsOnNonExistentProduct()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        await Assert.ThrowsAsync<ArgumentException>(() => service.RestockAsync(999, 10));
    }

    [Fact]
    public async Task GetLowStockItems_ReturnsEmpty_WhenAllAboveReorderLevel()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var items = await service.GetLowStockItemsAsync();
        Assert.Empty(items);
    }

    [Fact]
    public async Task GetLowStockItems_ReturnsItems_WhenBelowReorderLevel()
    {
        using var context = CreateContext();
        // Deduct most stock from product 1 to make it low-stock
        var item = await context.InventoryItems.FirstAsync(i => i.ProductId == 1);
        item.QuantityOnHand = 5;
        await context.SaveChangesAsync();

        var service = new InventoryBusinessService(context);
        var lowStock = await service.GetLowStockItemsAsync();
        Assert.Single(lowStock);
        Assert.Equal(1, lowStock[0].ProductId);
    }

    [Fact]
    public async Task CreateInventoryItem_CreatesNewRecord()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var request = new CreateInventoryItemRequest(99, "New Product", "NEW-001", 100, 20, "B-01");
        var result = await service.CreateInventoryItemAsync(request);
        Assert.Equal(99, result.ProductId);
        Assert.Equal("New Product", result.ProductName);
        Assert.Equal(100, result.QuantityOnHand);
    }

    [Fact]
    public async Task CreateInventoryItem_ThrowsOnDuplicate()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var request = new CreateInventoryItemRequest(1, "Duplicate", "DUP-001", 10, 5, "C-01");
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateInventoryItemAsync(request));
    }

    [Fact]
    public async Task CheckStock_ReturnsInStock_WhenSufficient()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var result = await service.CheckStockAsync(1, 10);
        Assert.True(result.InStock);
        Assert.Equal(50, result.QuantityOnHand);
    }

    [Fact]
    public async Task CheckStock_ReturnsNotInStock_WhenInsufficient()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var result = await service.CheckStockAsync(1, 999);
        Assert.False(result.InStock);
    }

    [Fact]
    public async Task CheckStock_ReturnsNotInStock_WhenProductNotFound()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var result = await service.CheckStockAsync(999, 1);
        Assert.False(result.InStock);
        Assert.Equal(0, result.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var result = await service.DeductStockAsync(1, 10);
        Assert.Equal(40, result.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeductStockAsync(1, 999));
    }

    [Fact]
    public async Task DeductStock_ThrowsOnNonExistentProduct()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        await Assert.ThrowsAsync<ArgumentException>(() => service.DeductStockAsync(999, 1));
    }

    [Fact]
    public async Task DeductStock_ThrowsOnZeroQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        await Assert.ThrowsAsync<ArgumentException>(() => service.DeductStockAsync(1, 0));
    }
}
