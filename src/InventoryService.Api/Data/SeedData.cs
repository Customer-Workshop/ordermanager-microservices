using InventoryService.Api.Models;

namespace InventoryService.Api.Data;

public static class SeedData
{
    public static void Initialize(InventoryDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.Products.Any()) return;

        var products = new[]
        {
            new Product { Name = "Widget A", Sku = "WGT-001" },
            new Product { Name = "Widget B", Sku = "WGT-002" },
            new Product { Name = "Gadget X", Sku = "GDG-001" },
            new Product { Name = "Gadget Y", Sku = "GDG-002" }
        };
        context.Products.AddRange(products);
        context.SaveChanges();

        var items = new[]
        {
            new InventoryItem { ProductId = products[0].Id, QuantityOnHand = 100, ReorderLevel = 10, WarehouseLocation = "A-1" },
            new InventoryItem { ProductId = products[1].Id, QuantityOnHand = 5, ReorderLevel = 10, WarehouseLocation = "A-2" },
            new InventoryItem { ProductId = products[2].Id, QuantityOnHand = 50, ReorderLevel = 15, WarehouseLocation = "B-1" },
            new InventoryItem { ProductId = products[3].Id, QuantityOnHand = 8, ReorderLevel = 20, WarehouseLocation = "B-2" }
        };
        context.InventoryItems.AddRange(items);
        context.SaveChanges();
    }
}
