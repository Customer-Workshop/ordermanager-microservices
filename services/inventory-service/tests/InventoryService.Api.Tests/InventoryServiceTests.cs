using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;
using InventoryService.Api.Data;
using InventoryService.Api.Services;
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
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
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
    public async Task GetAllInventory_ReturnsAllItems()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.GetAllInventoryAsync();
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetByProductId_ReturnsCorrectItem()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.GetInventoryByProductIdAsync(1);
        Assert.NotNull(result);
        Assert.Equal("Widget A", result.ProductName);
    }

    [Fact]
    public async Task GetByProductId_ReturnsNullForMissing()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.GetInventoryByProductIdAsync(999);
        Assert.Null(result);
    }

    [Fact]
    public async Task Restock_IncreasesQuantity()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.RestockAsync(1, 25);
        Assert.Equal(75, result.QuantityOnHand);
    }

    [Fact]
    public async Task GetLowStock_ReturnsOnlyLowItems()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var result = await service.GetLowStockItemsAsync();
        Assert.Single(result);
        Assert.Equal(2, result[0].ProductId);
    }

    [Fact]
    public async Task CheckAndReserve_SuccessfulReservation()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var request = new StockReservationRequest
        {
            Items = new List<StockReservationItem>
            {
                new() { ProductId = 1, Quantity = 10 }
            }
        };
        var result = await service.CheckAndReserveStockAsync(request);
        Assert.True(result.Success);
        Assert.Single(result.ReservedItems);
        Assert.Equal(40, result.ReservedItems[0].RemainingStock);
    }

    [Fact]
    public async Task CheckAndReserve_InsufficientStock()
    {
        using var context = CreateContext();
        var service = new InventoryItemService(context);
        var request = new StockReservationRequest
        {
            Items = new List<StockReservationItem>
            {
                new() { ProductId = 2, Quantity = 100 }
            }
        };
        var result = await service.CheckAndReserveStockAsync(request);
        Assert.False(result.Success);
        Assert.Contains("Insufficient stock", result.Error!);
    }
}
