using InventoryService.Api.Models;

namespace InventoryService.Api.Data;

public static class SeedData
{
    public static void Initialize(InventoryDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.InventoryItems.Any()) return;

        context.InventoryItems.AddRange(
            new InventoryItem { ProductId = 1, ProductName = "Widget A", QuantityOnHand = 100, ReorderLevel = 20, WarehouseLocation = "A1-01", LastRestocked = DateTime.UtcNow.AddDays(-5) },
            new InventoryItem { ProductId = 2, ProductName = "Widget B", QuantityOnHand = 5, ReorderLevel = 10, WarehouseLocation = "A1-02", LastRestocked = DateTime.UtcNow.AddDays(-30) },
            new InventoryItem { ProductId = 3, ProductName = "Gadget X", QuantityOnHand = 50, ReorderLevel = 15, WarehouseLocation = "B2-01", LastRestocked = DateTime.UtcNow.AddDays(-2) },
            new InventoryItem { ProductId = 4, ProductName = "Gadget Y", QuantityOnHand = 8, ReorderLevel = 10, WarehouseLocation = "B2-02", LastRestocked = DateTime.UtcNow.AddDays(-15) },
            new InventoryItem { ProductId = 5, ProductName = "Thingamajig", QuantityOnHand = 200, ReorderLevel = 25, WarehouseLocation = "C3-01", LastRestocked = DateTime.UtcNow }
        );

        context.SaveChanges();
    }
}
