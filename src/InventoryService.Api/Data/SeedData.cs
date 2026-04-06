using InventoryService.Api.Models;

namespace InventoryService.Api.Data;

public static class SeedData
{
    public static void Initialize(InventoryDbContext context)
    {
        context.Database.EnsureCreated();
        if (context.InventoryItems.Any()) return;

        context.InventoryItems.AddRange(
            new InventoryItem { ProductId = 1, ProductName = "Widget A", QuantityOnHand = 100, ReorderLevel = 10, WarehouseLocation = "A1-01" },
            new InventoryItem { ProductId = 2, ProductName = "Widget B", QuantityOnHand = 50, ReorderLevel = 10, WarehouseLocation = "A1-02" },
            new InventoryItem { ProductId = 3, ProductName = "Gadget X", QuantityOnHand = 200, ReorderLevel = 10, WarehouseLocation = "B2-01" },
            new InventoryItem { ProductId = 4, ProductName = "Gadget Y", QuantityOnHand = 150, ReorderLevel = 10, WarehouseLocation = "B2-02" },
            new InventoryItem { ProductId = 5, ProductName = "Thingamajig", QuantityOnHand = 250, ReorderLevel = 10, WarehouseLocation = "C3-01" }
        );
        context.SaveChanges();
    }
}
