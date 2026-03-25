using Microsoft.EntityFrameworkCore;
using InventoryService.Api.Data;
using InventoryService.Api.Services;
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
    public async Task GetAllInventory_ReturnsSeedData()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var items = await service.GetAllInventoryAsync();
        Assert.Equal(5, items.Count);
    }

    [Fact]
    public async Task GetByProductId_ReturnsCorrectItem()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(item);
        Assert.Equal("Widget A", item.ProductName);
    }

    [Fact]
    public async Task Restock_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        var qtyBefore = item!.QuantityOnHand;

        var updated = await service.RestockAsync(1, 25);
        Assert.Equal(qtyBefore + 25, updated.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_DecreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var item = await service.GetInventoryByProductIdAsync(1);
        var qtyBefore = item!.QuantityOnHand;

        var updated = await service.DeductStockAsync(1, 10);
        Assert.Equal(qtyBefore - 10, updated.QuantityOnHand);
    }

    [Fact]
    public async Task DeductStock_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.DeductStockAsync(1, 99999));
    }

    [Fact]
    public async Task GetLowStockItems_ReturnsEmptyWhenAllStocked()
    {
        using var context = CreateContext();
        var service = new InventoryBusinessService(context);
        var lowStock = await service.GetLowStockItemsAsync();
        Assert.Empty(lowStock);
    }
}
