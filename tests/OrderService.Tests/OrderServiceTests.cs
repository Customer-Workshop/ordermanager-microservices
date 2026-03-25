using Microsoft.EntityFrameworkCore;
using Moq;
using OrderService.Clients;
using OrderService.Data;
using OrderService.Models;
using OrderService.Services;
using Xunit;

namespace OrderService.Tests;

public class OrderServiceTests
{
    private OrderDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<OrderDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new OrderDbContext(options);
    }

    private static Mock<CustomerClient> CreateMockCustomerClient()
    {
        return new Mock<CustomerClient>(MockBehavior.Strict, new HttpClient());
    }

    private static Mock<ProductClient> CreateMockProductClient()
    {
        return new Mock<ProductClient>(MockBehavior.Strict, new HttpClient());
    }

    private static Mock<InventoryClient> CreateMockInventoryClient()
    {
        return new Mock<InventoryClient>(MockBehavior.Strict, new HttpClient());
    }

    [Fact]
    public async Task GetAllOrders_ReturnsEmptyList_WhenNoOrders()
    {
        using var context = CreateContext();
        var customerClient = CreateMockCustomerClient();
        var productClient = CreateMockProductClient();
        var inventoryClient = CreateMockInventoryClient();

        var service = new OrderSvc(context, customerClient.Object, productClient.Object, inventoryClient.Object);
        var orders = await service.GetAllOrdersAsync();
        Assert.Empty(orders);
    }

    [Fact]
    public async Task CreateOrder_Success()
    {
        using var context = CreateContext();
        var customerClient = CreateMockCustomerClient();
        var productClient = CreateMockProductClient();
        var inventoryClient = CreateMockInventoryClient();

        customerClient
            .Setup(c => c.GetCustomerAsync(1))
            .ReturnsAsync(new CustomerDto
            {
                Id = 1,
                Name = "John Doe",
                Email = "john@example.com",
                Address = "123 Main St",
                City = "Springfield",
                State = "IL",
                ZipCode = "62701"
            });

        productClient
            .Setup(p => p.GetProductAsync(1))
            .ReturnsAsync(new ProductDto { Id = 1, Name = "Widget", Price = 9.99m });

        inventoryClient
            .Setup(i => i.ReserveStockAsync(1, 5))
            .ReturnsAsync(new ReserveResult { Id = 1, ProductId = 1, QuantityOnHand = 95 });

        var service = new OrderSvc(context, customerClient.Object, productClient.Object, inventoryClient.Object);
        var order = await service.CreateOrderAsync(1, new List<(int, int)> { (1, 5) });

        Assert.Equal(1, order.CustomerId);
        Assert.Equal(49.95m, order.TotalAmount);
        Assert.Single(order.Items);
        Assert.Equal("123 Main St, Springfield, IL 62701", order.ShippingAddress);
        Assert.Equal("Pending", order.Status);

        var savedOrder = await context.Orders.Include(o => o.Items).FirstAsync();
        Assert.Equal(order.Id, savedOrder.Id);
    }

    [Fact]
    public async Task CreateOrder_ThrowsOnInsufficientStock()
    {
        using var context = CreateContext();
        var customerClient = CreateMockCustomerClient();
        var productClient = CreateMockProductClient();
        var inventoryClient = CreateMockInventoryClient();

        customerClient
            .Setup(c => c.GetCustomerAsync(1))
            .ReturnsAsync(new CustomerDto
            {
                Id = 1,
                Name = "John Doe",
                Email = "john@example.com",
                Address = "123 Main St",
                City = "Springfield",
                State = "IL",
                ZipCode = "62701"
            });

        productClient
            .Setup(p => p.GetProductAsync(1))
            .ReturnsAsync(new ProductDto { Id = 1, Name = "Widget", Price = 9.99m });

        inventoryClient
            .Setup(i => i.ReserveStockAsync(1, 99999))
            .ReturnsAsync((ReserveResult?)null);

        var service = new OrderSvc(context, customerClient.Object, productClient.Object, inventoryClient.Object);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateOrderAsync(1, new List<(int, int)> { (1, 99999) }));
    }
}
