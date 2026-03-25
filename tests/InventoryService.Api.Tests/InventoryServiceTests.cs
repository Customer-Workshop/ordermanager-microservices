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
        SeedData.Initialize(context);
        return context;
    }

    [Fact]
    public async Task GetAllInventory_ReturnsSeededItems()
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
        var item = await service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(item);
        Assert.Equal("Widget A", item.ProductName);
        Assert.Equal(50, item.QuantityOnHand);
    }

    [Fact]
    public async Task GetInventoryByProductId_ReturnsNull_WhenNotFound()
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
        var item = await service.RestockAsync(1, 25);
        Assert.Equal(75, item.QuantityOnHand);
    }

    [Fact]
    public async Task Restock_ThrowsOnInvalidQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<ArgumentException>(() => service.RestockAsync(1, 0));
    }

    [Fact]
    public async Task Restock_ThrowsOnMissingProduct()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<ArgumentException>(() => service.RestockAsync(999, 10));
    }

    [Fact]
    public async Task GetLowStockItems_ReturnsEmpty_WhenAllStocked()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var items = await service.GetLowStockItemsAsync();
        Assert.Empty(items);
    }

    [Fact]
    public async Task DeductStock_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var item = await service.DeductStockAsync(1, 10);
        Assert.Equal(40, item.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeductStockAsync(1, 99999));
    }

    [Fact]
    public async Task CheckStock_ReturnsAvailable_WhenSufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.CheckStockAsync(new StockCheckRequest(1, 10));
        Assert.True(result.Available);
        Assert.Equal(50, result.QuantityOnHand);
    }

    [Fact]
    public async Task CheckStock_ReturnsUnavailable_WhenInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.CheckStockAsync(new StockCheckRequest(1, 99999));
        Assert.False(result.Available);
    }

    [Fact]
    public async Task CheckStock_ReturnsUnavailable_WhenProductNotFound()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.CheckStockAsync(new StockCheckRequest(999, 1));
        Assert.False(result.Available);
        Assert.Equal(0, result.QuantityOnHand);
    }

    [Fact]
    public async Task CreateInventoryItem_AddsNewItem()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var request = new CreateInventoryItemRequest(99, "New Product", "NEW-001", 100, 20, "B-01");
        var item = await service.CreateInventoryItemAsync(request);
        Assert.Equal(99, item.ProductId);
        Assert.Equal("New Product", item.ProductName);
        Assert.Equal(100, item.QuantityOnHand);
    }

    [Fact]
    public async Task CreateInventoryItem_ThrowsOnDuplicate()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var request = new CreateInventoryItemRequest(1, "Widget A", "WGT-001", 100, 10, "A-01");
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateInventoryItemAsync(request));
    }

    [Fact]
    public async Task DeleteInventoryItem_RemovesItem()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var items = await service.GetAllInventoryAsync();
        var firstId = items.First().Id;
        await service.DeleteInventoryItemAsync(firstId);
        var remaining = await service.GetAllInventoryAsync();
        Assert.Equal(4, remaining.Count);
    }

    [Fact]
    public async Task UpdateInventoryItem_UpdatesFields()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var items = await service.GetAllInventoryAsync();
        var firstId = items.First().Id;
        var updated = await service.UpdateInventoryItemAsync(firstId, new UpdateInventoryItemRequest(999, 50, "Z-99"));
        Assert.Equal(999, updated.QuantityOnHand);
        Assert.Equal(50, updated.ReorderLevel);
        Assert.Equal("Z-99", updated.WarehouseLocation);
    }
}
