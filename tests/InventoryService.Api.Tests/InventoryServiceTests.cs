using Microsoft.EntityFrameworkCore;
using Xunit;
using InventoryService.Api.Data;
using InventoryService.Api.Models;
using InventoryService.Api.Services;

namespace InventoryService.Api.Tests;

public class InventoryServiceTests : IDisposable
{
    private readonly InventoryDbContext _context;
    private readonly InventoryItemService _service;

    public InventoryServiceTests()
    {
        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new InventoryDbContext(options);
        _context.InventoryItems.AddRange(
            new InventoryItem { Id = 1, ProductId = 1, ProductName = "Widget A", QuantityOnHand = 100, ReorderLevel = 20, WarehouseLocation = "A1-01" },
            new InventoryItem { Id = 2, ProductId = 2, ProductName = "Widget B", QuantityOnHand = 5, ReorderLevel = 10, WarehouseLocation = "A1-02" },
            new InventoryItem { Id = 3, ProductId = 3, ProductName = "Gadget X", QuantityOnHand = 50, ReorderLevel = 15, WarehouseLocation = "B2-01" }
        );
        _context.SaveChanges();
        _service = new InventoryItemService(_context);
    }

    public void Dispose() => _context.Dispose();

    [Fact]
    public async Task GetAllInventory_ReturnsAllItems()
    {
        var items = await _service.GetAllInventoryAsync();
        Assert.Equal(3, items.Count);
    }

    [Fact]
    public async Task GetByProductId_ExistingProduct_ReturnsItem()
    {
        var item = await _service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(item);
        Assert.Equal("Widget A", item.ProductName);
    }

    [Fact]
    public async Task GetByProductId_NonExistingProduct_ReturnsNull()
    {
        var item = await _service.GetInventoryByProductIdAsync(999);
        Assert.Null(item);
    }

    [Fact]
    public async Task Restock_ValidQuantity_IncreasesStock()
    {
        var item = await _service.RestockAsync(1, 50);
        Assert.Equal(150, item.QuantityOnHand);
    }

    [Fact]
    public async Task Restock_InvalidQuantity_ThrowsArgumentException()
    {
        await Assert.ThrowsAsync<ArgumentException>(() => _service.RestockAsync(1, 0));
    }

    [Fact]
    public async Task Restock_NonExistingProduct_ThrowsKeyNotFoundException()
    {
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.RestockAsync(999, 10));
    }

    [Fact]
    public async Task DeductStock_ValidQuantity_DecreasesStock()
    {
        var item = await _service.DeductStockAsync(1, 30);
        Assert.Equal(70, item.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_InsufficientStock_ThrowsInvalidOperationException()
    {
        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeductStockAsync(2, 100));
    }

    [Fact]
    public async Task GetLowStockItems_ReturnsItemsBelowReorderLevel()
    {
        var items = await _service.GetLowStockItemsAsync();
        Assert.Single(items);
        Assert.Equal("Widget B", items[0].ProductName);
    }
}
