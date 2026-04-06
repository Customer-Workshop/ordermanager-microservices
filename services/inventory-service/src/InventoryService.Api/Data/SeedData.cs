using InventoryService.Api.Models;

namespace InventoryService.Api.Data;

public static class SeedData
{
    public static void Initialize(InventoryDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.InventoryItems.Any())
            return;

        context.InventoryItems.AddRange(
            new InventoryItem { ProductId = 1, ProductName = "Widget A", Sku = "WGT-001", QuantityOnHand = 100, ReorderLevel = 20, LastRestocked = DateTime.UtcNow },
            new InventoryItem { ProductId = 2, ProductName = "Widget B", Sku = "WGT-002", QuantityOnHand = 50, ReorderLevel = 10, LastRestocked = DateTime.UtcNow },
            new InventoryItem { ProductId = 3, ProductName = "Gadget X", Sku = "GDG-001", QuantityOnHand = 5, ReorderLevel = 15, LastRestocked = DateTime.UtcNow.AddDays(-30) }
        );

        context.SaveChanges();
    }
}
