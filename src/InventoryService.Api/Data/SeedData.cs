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
            new Product { Name = "Widget A", Sku = "WGT-001", Price = 9.99m },
            new Product { Name = "Widget B", Sku = "WGT-002", Price = 19.99m },
            new Product { Name = "Gadget X", Sku = "GDG-001", Price = 29.99m },
            new Product { Name = "Gadget Y", Sku = "GDG-002", Price = 49.99m },
            new Product { Name = "Thingamajig", Sku = "THG-001", Price = 14.99m },
        };
        context.Products.AddRange(products);
        context.SaveChanges();

        var inventoryItems = products.Select((p, i) => new InventoryItem
        {
            ProductId = p.Id,
            QuantityOnHand = (i + 1) * 50,
            ReorderLevel = 10,
            WarehouseLocation = $"A-{i + 1:D2}"
        }).ToArray();
        context.InventoryItems.AddRange(inventoryItems);
        context.SaveChanges();
    }
}
