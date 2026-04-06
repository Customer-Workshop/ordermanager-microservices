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
            new InventoryItem { Id = 1, ProductId = 1, ProductName = "Widget A", QuantityOnHand = 50, ReorderLevel = 10, WarehouseLocation = "A-01" },
            new InventoryItem { Id = 2, ProductId = 2, ProductName = "Widget B", QuantityOnHand = 5, ReorderLevel = 10, WarehouseLocation = "A-02" }
        );
        _context.SaveChanges();
        _service = new InventoryItemService(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    [Fact]
    public async Task GetAllInventory_ReturnsAllItems()
    {
        var items = await _service.GetAllInventoryAsync();
        Assert.Equal(2, items.Count);
    }

    [Fact]
    public async Task GetByProductId_ReturnsCorrectItem()
    {
        var item = await _service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(item);
        Assert.Equal("Widget A", item.ProductName);
    }

    [Fact]
    public async Task GetByProductId_ReturnsNull_WhenNotFound()
    {
        var item = await _service.GetInventoryByProductIdAsync(999);
        Assert.Null(item);
    }

    [Fact]
    public async Task Restock_IncreasesQuantity()
    {
        var item = await _service.RestockAsync(1, 25);
        Assert.Equal(75, item.QuantityOnHand);
    }

    [Fact]
    public async Task GetLowStockItems_ReturnsOnlyLowStock()
    {
        var items = await _service.GetLowStockItemsAsync();
        Assert.Single(items);
        Assert.Equal(2, items[0].ProductId);
    }

    [Fact]
    public async Task CheckStock_ReturnsTrueWhenSufficient()
    {
        var result = await _service.CheckStockAsync(1, 10);
        Assert.True(result);
    }

    [Fact]
    public async Task CheckStock_ReturnsFalseWhenInsufficient()
    {
        var result = await _service.CheckStockAsync(2, 100);
        Assert.False(result);
    }

    [Fact]
    public async Task DeductStock_DeductsQuantity()
    {
        var item = await _service.DeductStockAsync(1, 10);
        Assert.NotNull(item);
        Assert.Equal(40, item.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ReturnsNull_WhenInsufficient()
    {
        var item = await _service.DeductStockAsync(2, 100);
        Assert.Null(item);
    }
}
