using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using CustomerService.Data;

namespace IntegrationTests.Factories;

public class CustomerServiceFactory : WebApplicationFactory<CustomerService.Program>
{
    private readonly string _dbName = "CustomerServiceTestDb_" + Guid.NewGuid().ToString("N");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<CustomerDbContext>));

            if (descriptor != null)
                services.Remove(descriptor);

            services.AddDbContext<CustomerDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));
        });
    }
}
