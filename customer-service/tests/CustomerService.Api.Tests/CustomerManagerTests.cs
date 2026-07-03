using Microsoft.EntityFrameworkCore;
using Xunit;
using CustomerService.Api.Data;
using CustomerService.Api.Models;
using CustomerService.Api.Services;

namespace CustomerService.Api.Tests;

public class CustomerManagerTests
{
    private CustomerDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<CustomerDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new CustomerDbContext(options);
        SeedData.Initialize(context);
        return context;
    }

    [Fact]
    public async Task GetAllCustomers_ReturnsSeededCustomers()
    {
        using var context = CreateContext();
        var manager = new CustomerManager(context);
        var customers = await manager.GetAllCustomersAsync();
        Assert.Equal(3, customers.Count);
    }

    [Fact]
    public async Task GetCustomerById_ReturnsCustomer()
    {
        using var context = CreateContext();
        var manager = new CustomerManager(context);
        var customer = await manager.GetCustomerByIdAsync(1);
        Assert.NotNull(customer);
        Assert.Equal(1, customer!.Id);
    }

    [Fact]
    public async Task GetCustomerById_ReturnsNull_WhenMissing()
    {
        using var context = CreateContext();
        var manager = new CustomerManager(context);
        var customer = await manager.GetCustomerByIdAsync(999);
        Assert.Null(customer);
    }

    [Fact]
    public async Task CreateCustomer_PersistsCustomer()
    {
        using var context = CreateContext();
        var manager = new CustomerManager(context);
        var created = await manager.CreateCustomerAsync(new Customer
        {
            Name = "Umbrella Corp",
            Email = "orders@umbrella.com",
            Phone = "555-0400",
            Address = "1 Raccoon Way",
            City = "Raccoon City",
            State = "MO",
            ZipCode = "63101"
        });
        Assert.True(created.Id > 0);
        var all = await manager.GetAllCustomersAsync();
        Assert.Equal(4, all.Count);
    }

    [Theory]
    [InlineData("", "new@example.com")]
    [InlineData("   ", "new@example.com")]
    [InlineData("New Co", "")]
    [InlineData("New Co", "   ")]
    public async Task CreateCustomer_ThrowsOnMissingNameOrEmail(string name, string email)
    {
        using var context = CreateContext();
        var manager = new CustomerManager(context);
        await Assert.ThrowsAsync<ArgumentException>(
            () => manager.CreateCustomerAsync(new Customer { Name = name, Email = email }));
    }

    [Fact]
    public async Task CreateCustomer_ThrowsOnDuplicateEmail()
    {
        using var context = CreateContext();
        var manager = new CustomerManager(context);
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => manager.CreateCustomerAsync(new Customer { Name = "Acme Clone", Email = "orders@acme.com" }));
    }
}
