using Microsoft.EntityFrameworkCore;
using OrderService.Clients;
using OrderService.Data;
using OrderService.Models;

namespace OrderService.Services;

public class OrderSvc
{
    private readonly OrderDbContext _context;
    private readonly CustomerClient _customerClient;
    private readonly ProductClient _productClient;
    private readonly InventoryClient _inventoryClient;

    public OrderSvc(
        OrderDbContext context,
        CustomerClient customerClient,
        ProductClient productClient,
        InventoryClient inventoryClient)
    {
        _context = context;
        _customerClient = customerClient;
        _productClient = productClient;
        _inventoryClient = inventoryClient;
    }

    public async Task<List<Order>> GetAllOrdersAsync()
    {
        return await _context.Orders
            .Include(o => o.Items)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }

    public async Task<Order?> GetOrderByIdAsync(int id)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<Order> CreateOrderAsync(int customerId, List<(int ProductId, int Quantity)> items)
    {
        var customer = await _customerClient.GetCustomerAsync(customerId)
            ?? throw new ArgumentException($"Customer {customerId} not found");

        var order = new Order
        {
            CustomerId = customerId,
            ShippingAddress = $"{customer.Address}, {customer.City}, {customer.State} {customer.ZipCode}"
        };

        foreach (var (productId, quantity) in items)
        {
            var product = await _productClient.GetProductAsync(productId)
                ?? throw new ArgumentException($"Product {productId} not found");

            var reserveResult = await _inventoryClient.ReserveStockAsync(productId, quantity)
                ?? throw new InvalidOperationException($"Insufficient stock for {product.Name}");

            order.Items.Add(new OrderItem
            {
                ProductId = productId,
                Quantity = quantity,
                UnitPrice = product.Price
            });
        }

        order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<Order> UpdateOrderStatusAsync(int orderId, string status)
    {
        var order = await _context.Orders.FindAsync(orderId)
            ?? throw new ArgumentException($"Order {orderId} not found");
        order.Status = status;
        await _context.SaveChangesAsync();
        return order;
    }
}
