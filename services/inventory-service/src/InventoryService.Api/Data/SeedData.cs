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
            new Product { Name = "Widget A", Sku = "WDG-001", Price = 9.99m },
            new Product { Name = "Widget B", Sku = "WDG-002", Price = 14.99m },
            new Product { Name = "Gadget X", Sku = "GDG-001", Price = 24.99m },
            new Product { Name = "Gadget Y", Sku = "GDG-002", Price = 29.99m },
            new Product { Name = "Thingamajig", Sku = "THG-001", Price = 4.99m }
        };

        context.Products.AddRange(products);
        context.SaveChanges();

        var inventoryItems = new[]
        {
            new InventoryItem { ProductId = products[0].Id, QuantityOnHand = 100, ReorderLevel = 10, WarehouseLocation = "A-01" },
            new InventoryItem { ProductId = products[1].Id, QuantityOnHand = 50, ReorderLevel = 15, WarehouseLocation = "A-02" },
            new InventoryItem { ProductId = products[2].Id, QuantityOnHand = 75, ReorderLevel = 20, WarehouseLocation = "B-01" },
            new InventoryItem { ProductId = products[3].Id, QuantityOnHand = 5, ReorderLevel = 10, WarehouseLocation = "B-02" },
            new InventoryItem { ProductId = products[4].Id, QuantityOnHand = 200, ReorderLevel = 50, WarehouseLocation = "C-01" }
        };

        context.InventoryItems.AddRange(inventoryItems);
        context.SaveChanges();
    }
}
