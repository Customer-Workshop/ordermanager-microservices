using InventoryService.Api.Models;

namespace InventoryService.Api.Data;

public static class SeedData
{
    public static void Initialize(InventoryDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.InventoryItems.Any()) return;

        var items = new[]
        {
            new InventoryItem { ProductId = 1, ProductName = "Widget A", Sku = "WGT-001", QuantityOnHand = 50,  ReorderLevel = 10, WarehouseLocation = "A-01" },
            new InventoryItem { ProductId = 2, ProductName = "Widget B", Sku = "WGT-002", QuantityOnHand = 100, ReorderLevel = 10, WarehouseLocation = "A-02" },
            new InventoryItem { ProductId = 3, ProductName = "Gadget X", Sku = "GDG-001", QuantityOnHand = 150, ReorderLevel = 10, WarehouseLocation = "A-03" },
            new InventoryItem { ProductId = 4, ProductName = "Gadget Y", Sku = "GDG-002", QuantityOnHand = 200, ReorderLevel = 10, WarehouseLocation = "A-04" },
            new InventoryItem { ProductId = 5, ProductName = "Thingamajig", Sku = "THG-001", QuantityOnHand = 250, ReorderLevel = 10, WarehouseLocation = "A-05" },
        };

        context.InventoryItems.AddRange(items);
        context.SaveChanges();
    }
}
