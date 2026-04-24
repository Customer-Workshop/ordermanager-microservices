using Microsoft.EntityFrameworkCore;
using InventoryService.Data;
using InventoryService.Models;
using InventoryService.Services;
using Xunit;

namespace InventoryService.Tests;

public class InventoryBusinessServiceTests
{
    private static InventoryDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new InventoryDbContext(options);
        context.InventoryItems.AddRange(
            new InventoryItem { Id = 1, ProductId = 1, ProductName = "Widget A", Sku = "WGT-001", QuantityOnHand = 50, ReorderLevel = 10, WarehouseLocation = "A-01" },
            new InventoryItem { Id = 2, ProductId = 2, ProductName = "Widget B", Sku = "WGT-002", QuantityOnHand = 5, ReorderLevel = 10, WarehouseLocation = "A-02" }
        );
        context.SaveChanges();
        return context;
    }

    [Fact]
    public async Task GetAllInventoryAsync_ReturnsAllItems()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryBusinessService(context);

        var result = await service.GetAllInventoryAsync();

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsCorrectItem()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryBusinessService(context);

        var result = await service.GetInventoryByProductIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("Widget A", result.ProductName);
    }

    [Fact]
    public async Task GetInventoryByProductIdAsync_ReturnsNullForMissingProduct()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryBusinessService(context);

        var result = await service.GetInventoryByProductIdAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task RestockAsync_IncreasesQuantity()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryBusinessService(context);

        var result = await service.RestockAsync(1, 25);

        Assert.Equal(75, result.QuantityOnHand);
    }

    [Fact]
    public async Task RestockAsync_ThrowsForMissingProduct()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryBusinessService(context);

        await Assert.ThrowsAsync<ArgumentException>(() => service.RestockAsync(999, 10));
    }

    [Fact]
    public async Task GetLowStockItemsAsync_ReturnsOnlyLowStockItems()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryBusinessService(context);

        var result = await service.GetLowStockItemsAsync();

        Assert.Single(result);
        Assert.Equal("Widget B", result[0].ProductName);
    }

    [Fact]
    public async Task CreateAsync_AddsNewItem()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryBusinessService(context);

        var newItem = new InventoryItem
        {
            ProductId = 3,
            ProductName = "Gadget X",
            Sku = "GDG-001",
            QuantityOnHand = 100,
            ReorderLevel = 15,
            WarehouseLocation = "B-01"
        };

        var result = await service.CreateAsync(newItem);

        Assert.True(result.Id > 0);
        Assert.Equal(3, (await service.GetAllInventoryAsync()).Count);
    }

    [Fact]
    public async Task DeleteAsync_RemovesItem()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryBusinessService(context);

        var deleted = await service.DeleteAsync(1);

        Assert.True(deleted);
        Assert.Single(await service.GetAllInventoryAsync());
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalseForMissingItem()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryBusinessService(context);

        var deleted = await service.DeleteAsync(999);

        Assert.False(deleted);
    }
}
