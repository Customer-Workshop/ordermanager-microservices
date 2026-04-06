using InventoryService.Api.Models;

namespace InventoryService.Api.Data;

public static class SeedData
{
    public static void Initialize(InventoryDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.InventoryItems.Any()) return;

        var items = new List<InventoryItem>
        {
            new() { ProductId = 1, ProductName = "Widget A", Sku = "WGT-001", QuantityOnHand = 50, ReorderLevel = 10, WarehouseLocation = "A-01", LastRestocked = DateTime.UtcNow.AddDays(-5) },
            new() { ProductId = 2, ProductName = "Widget B", Sku = "WGT-002", QuantityOnHand = 30, ReorderLevel = 15, WarehouseLocation = "A-02", LastRestocked = DateTime.UtcNow.AddDays(-3) },
            new() { ProductId = 3, ProductName = "Gadget X", Sku = "GDG-001", QuantityOnHand = 5, ReorderLevel = 10, WarehouseLocation = "B-01", LastRestocked = DateTime.UtcNow.AddDays(-10) },
            new() { ProductId = 4, ProductName = "Gadget Y", Sku = "GDG-002", QuantityOnHand = 100, ReorderLevel = 20, WarehouseLocation = "B-02", LastRestocked = DateTime.UtcNow.AddDays(-1) },
            new() { ProductId = 5, ProductName = "Doohickey", Sku = "DHK-001", QuantityOnHand = 3, ReorderLevel = 5, WarehouseLocation = "C-01", LastRestocked = DateTime.UtcNow.AddDays(-15) }
        };

        context.InventoryItems.AddRange(items);
        context.SaveChanges();
    }
}
