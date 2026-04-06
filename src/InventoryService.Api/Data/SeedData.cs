using InventoryService.Api.Models;

namespace InventoryService.Api.Data;

public static class SeedData
{
    private const int DefaultReorderLevel = 10;

    public static void Initialize(InventoryDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.InventoryItems.Any()) return;

        var items = new[]
        {
            new InventoryItem { ProductId = 1, ProductName = "Widget A", QuantityOnHand = 50, ReorderLevel = DefaultReorderLevel, WarehouseLocation = "A-01" },
            new InventoryItem { ProductId = 2, ProductName = "Widget B", QuantityOnHand = 100, ReorderLevel = DefaultReorderLevel, WarehouseLocation = "A-02" },
            new InventoryItem { ProductId = 3, ProductName = "Gadget X", QuantityOnHand = 150, ReorderLevel = DefaultReorderLevel, WarehouseLocation = "A-03" },
            new InventoryItem { ProductId = 4, ProductName = "Gadget Y", QuantityOnHand = 200, ReorderLevel = DefaultReorderLevel, WarehouseLocation = "A-04" },
            new InventoryItem { ProductId = 5, ProductName = "Thingamajig", QuantityOnHand = 250, ReorderLevel = DefaultReorderLevel, WarehouseLocation = "A-05" },
        };

        context.InventoryItems.AddRange(items);
        context.SaveChanges();
    }
}
