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
        _service = new InventoryItemService(_context);

        _context.InventoryItems.AddRange(
            new InventoryItem { Id = 1, ProductId = 1, ProductName = "Widget A", QuantityOnHand = 50, ReorderLevel = 10, WarehouseLocation = "A-01" },
            new InventoryItem { Id = 2, ProductId = 2, ProductName = "Widget B", QuantityOnHand = 5, ReorderLevel = 10, WarehouseLocation = "A-02" }
        );
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetAllInventoryAsync_ReturnsAllItems()
    {
        var items = await _service.GetAllInventoryAsync();
        Assert.Equal(2, items.Count);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsItem()
    {
        var item = await _service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(item);
        Assert.Equal("Widget A", item.ProductName);
        Assert.Equal(50, item.QuantityOnHand);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsNull_WhenNotFound()
    {
        var item = await _service.GetInventoryByProductIdAsync(999);
        Assert.Null(item);
    }

    [Fact]
    public async Task RestockAsync_IncreasesQuantity()
    {
        var item = await _service.RestockAsync(1, 25);
        Assert.Equal(75, item.QuantityOnHand);
    }

    [Fact]
    public async Task RestockAsync_ThrowsForMissingProduct()
    {
        await Assert.ThrowsAsync<ArgumentException>(() => _service.RestockAsync(999, 10));
    }

    [Fact]
    public async Task DeductStockAsync_DecreasesQuantity()
    {
        var item = await _service.DeductStockAsync(1, 10);
        Assert.Equal(40, item.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStockAsync_ThrowsForInsufficientStock()
    {
        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeductStockAsync(1, 100));
    }

    [Fact]
    public async Task DeductStockAsync_ThrowsForMissingProduct()
    {
        await Assert.ThrowsAsync<ArgumentException>(() => _service.DeductStockAsync(999, 10));
    }

    [Fact]
    public async Task GetLowStockItemsAsync_ReturnsLowStockOnly()
    {
        var items = await _service.GetLowStockItemsAsync();
        Assert.Single(items);
        Assert.Equal("Widget B", items[0].ProductName);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
