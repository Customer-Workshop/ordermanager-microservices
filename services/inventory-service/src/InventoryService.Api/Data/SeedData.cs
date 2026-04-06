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
            new Product { Name = "Laptop Pro 15", Sku = "LAP-PRO-15", Price = 1299.99m },
            new Product { Name = "Wireless Mouse", Sku = "WRL-MOU-01", Price = 29.99m },
            new Product { Name = "USB-C Hub", Sku = "USB-HUB-7P", Price = 49.99m },
            new Product { Name = "Monitor 27\"", Sku = "MON-27-4K", Price = 449.99m },
            new Product { Name = "Keyboard Mechanical", Sku = "KBD-MEC-01", Price = 89.99m }
        };

        context.Products.AddRange(products);
        context.SaveChanges();

        var inventoryItems = new[]
        {
            new InventoryItem { ProductId = products[0].Id, QuantityOnHand = 50, ReorderLevel = 10, WarehouseLocation = "A1-01" },
            new InventoryItem { ProductId = products[1].Id, QuantityOnHand = 200, ReorderLevel = 50, WarehouseLocation = "B2-03" },
            new InventoryItem { ProductId = products[2].Id, QuantityOnHand = 5, ReorderLevel = 20, WarehouseLocation = "C3-07" },
            new InventoryItem { ProductId = products[3].Id, QuantityOnHand = 30, ReorderLevel = 15, WarehouseLocation = "A2-05" },
            new InventoryItem { ProductId = products[4].Id, QuantityOnHand = 8, ReorderLevel = 10, WarehouseLocation = "B1-02" }
        };

        context.InventoryItems.AddRange(inventoryItems);
        context.SaveChanges();
    }
}
