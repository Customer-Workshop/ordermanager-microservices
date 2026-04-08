using OrderService.Api.Models;

namespace OrderService.Api.Data;

public static class SeedData
{
    public static void Initialize(OrderDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.Orders.Any()) return;

        var order1 = new Order
        {
            CustomerId = 1,
            OrderDate = new DateTime(2025, 1, 15, 10, 30, 0, DateTimeKind.Utc),
            Status = "Shipped",
            ShippingAddress = "123 Main St, Springfield, IL 62701",
            TotalAmount = 49.97m,
            Items = new List<OrderItem>
            {
                new OrderItem { ProductId = 1, Quantity = 2, UnitPrice = 9.99m },
                new OrderItem { ProductId = 3, Quantity = 1, UnitPrice = 29.99m },
            }
        };

        var order2 = new Order
        {
            CustomerId = 2,
            OrderDate = new DateTime(2025, 2, 20, 14, 0, 0, DateTimeKind.Utc),
            Status = "Pending",
            ShippingAddress = "456 Oak Ave, Shelbyville, IL 62565",
            TotalAmount = 19.99m,
            Items = new List<OrderItem>
            {
                new OrderItem { ProductId = 2, Quantity = 1, UnitPrice = 19.99m },
            }
        };

        context.Orders.AddRange(order1, order2);
        context.SaveChanges();
    }
}
