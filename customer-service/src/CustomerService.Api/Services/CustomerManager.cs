using Microsoft.EntityFrameworkCore;
using CustomerService.Api.Data;
using CustomerService.Api.Models;

namespace CustomerService.Api.Services;

public class CustomerManager
{
    private readonly CustomerDbContext _context;

    public CustomerManager(CustomerDbContext context)
    {
        _context = context;
    }

    public async Task<List<Customer>> GetAllCustomersAsync()
    {
        return await _context.Customers.ToListAsync();
    }

    public async Task<Customer?> GetCustomerByIdAsync(int id)
    {
        return await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Customer> CreateCustomerAsync(Customer customer)
    {
        if (string.IsNullOrWhiteSpace(customer.Name))
            throw new ArgumentException("Customer name is required.");
        if (string.IsNullOrWhiteSpace(customer.Email))
            throw new ArgumentException("Customer email is required.");
        if (await _context.Customers.AnyAsync(c => c.Email == customer.Email))
            throw new InvalidOperationException($"A customer with email {customer.Email} already exists.");

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
        return customer;
    }
}
