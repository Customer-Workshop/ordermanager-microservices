using InventoryService.Api.Models;

namespace InventoryService.Api.Data;

public static class SeedData
{
    public static void Initialize(InventoryDbContext context)
    {
        if (context.InventoryItems.Any()) return;

        context.InventoryItems.AddRange(
            new InventoryItem { ProductId = 1, ProductName = "Widget A", Sku = "WGT-001", QuantityOnHand = 50, ReorderLevel = 10, WarehouseLocation = "A1-01" },
            new InventoryItem { ProductId = 2, ProductName = "Widget B", Sku = "WGT-002", QuantityOnHand = 5, ReorderLevel = 10, WarehouseLocation = "A1-02" },
            new InventoryItem { ProductId = 3, ProductName = "Gadget X", Sku = "GDG-001", QuantityOnHand = 100, ReorderLevel = 20, WarehouseLocation = "B2-01" }
        );
        context.SaveChanges();
    }
}
